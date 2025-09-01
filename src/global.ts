import { readFileSync } from 'fs'
import c from 'chalk'
import dotenv from 'dotenv'
dotenv.config();

// Static numbers
export const dragonsHeadId = '360287970202488740'
export const dragonsTailId = '360287970204104859'
export const bigCraftThreshold = 1
export const fruitRecourceId = 182331452
export const waystoneBuildingId = 205715693

// Webhook message colors
const colorRed = 8388608
const colorGreen = 32768
const colorYellow = 8421376

// Used for links
const fruitTrackerLink = 'https://bitcraftmap.com/?#'
const fruitTrackerURIComponent = '{%22type%22:%22FeatureCollection%22,%22features%22:[{%22type%22:%22Feature%22,%22properties%22:{%22iconName%22:%22waypoint%22},%22geometry%22:{%22type%22:%22MultiPoint%22,%22coordinates%22:[{coordinates}]}}]}'
const webhookMessage = '{"content": null,"embeds": [{"title": "{title}","description": "{description}","url": "{url}","color": {color}}],"attachments": []}'
export const bigCraftWebhookLink = process.env.BIG_CRAFT_TRACKER_WEBHOOK
export const fruitTrackerWebhookLink = process.env.FRUIT_TRACKER_WEBHOOK

// Static lists/maps
export const buildingTypes: Map<string, string> = new Map()
export const craftingRecipes: Map<string, [station: string, tier: string, effort: number]> = new Map()

// Static-ish lists/maps (They are kept up to date by events)
export const buildings: Map<string, string> = new Map() // building entity id > claim entity id
export const playerUsernames: Map<string, string> = new Map()
export const empires: Map<string, string> = new Map()
export const empirePlayerData: Map<string, string> = new Map()
export const claimsWithWaystones: Map<string, string> = new Map()
export const claimTotemPositions: Map<string, number> = new Map()

// Trackers data
export const waystoneLocations: Map<string, [string, number]> = new Map() // Key is waystone id, value packed XZ coordinates
export const resourceLocations: Map<number, Map<string, number>> = new Map() // Outer key is resource id, inner key is entity id, inner value is packed XZ coordinates

// Queues (should be empty most of the time, or at least not keep increasing after the initial subscription)
export const ResourceStateQueue: Map<string, number> = new Map() // Key is the resource entity id, value is its resource type id
export const LocationStateQueue: Map<string, number> = new Map() // Key is the location entity id, value is the packed xz coordinates
export const timeoutQueue: Map<string, NodeJS.Timeout> = new Map()

function format(string: string, values: Record<string, any>) {
  return string.replace(/{(\w+)}/g, (match, key) =>
    key in values ? values[key] : match
  );
}

export function loadBuildingDesc() {
	const buildingsData = JSON.parse(readFileSync('./utils/buildingTypes.jsonl', 'utf8')) as { id: number, name: string }[];
	for (let buildingInfo of buildingsData) {
		buildingTypes.set(buildingInfo.id.toString(), buildingInfo.name)
	}
}

export function loadRecipeDesc() {
	const recipesData = JSON.parse(readFileSync('./utils/craftingRecipes.jsonl', 'utf8')) as { id: number, building_type: number, tier: number, actions_required: number}[];
	for (let recipe of recipesData) {
		const buildingName = buildingTypes.get(recipe.building_type.toString())
		if (!buildingName) continue;
		craftingRecipes.set(recipe.id.toString(), [buildingName, recipe.tier.toString(), recipe.actions_required])
	}
}

// Utility functions to make locations use less memory
export function packLocation(x: number, z: number) {
	return (x << 15) | z;
}

export function unpackLocation(packed: number): [number, number] {
	return [packed >> 15, packed & 0x7FFF]
}

// Function that handles the queues
export function timeout(id: string) {
	if (timeoutQueue.has(id)) return;
	
	const timeout = setTimeout(()=> {
		const res = ResourceStateQueue.get(id) // Get stored resource id
		const loc = LocationStateQueue.get(id) // Get stored packd location
		const bld = buildings.get(id) // get claim id

		if (bld) {
			const claimName = claimsWithWaystones.get(bld) // get claim name
			// For waystone tracking
			if (loc && claimName) {
				waystoneLocations.set(id, [bld, loc])
			}
		}
		
		// LOC + RES = Resource Location (used for resource tracking)
		if (loc && res) {
			let resLocs = resourceLocations.get(res) 		// Get the current list of resourceLocations
			if (!resLocs) resLocs = new Map<string, number> // If this resource type wasn't stored yet, create it now
			resLocs.set(id, loc) 							// Add it to the map
			resourceLocations.set(res, resLocs) 			// set it to the global variable
		}
		
		//! Don't remove from buildings variable as it is currently used for location updates (in case someone moves a waystone around)
		ResourceStateQueue.delete(id)
		LocationStateQueue.delete(id)
		timeoutQueue.delete(id)
	}, 1000)

	timeoutQueue.set(id, timeout)
}

export type CraftInfo = {
	owner: string,
	empire: string | undefined,
	effort: number,
	tier: string,
	station: string,
	location: string
}

export async function sendWebhookMessage(data: 'init' | 'wsError' | 'wsDisconnect' | 'codeError' | 'fruit' | CraftInfo ) {
	let content = ''
	let targetChat = 'all'
	if (typeof data === 'string') {
		switch (data) {
			case 'init':
				content = format(webhookMessage, {title: 'Service is back online!', description:'', url: '', color: colorGreen})
				break;
			case 'wsError':
				content = format(webhookMessage, {title: 'Websocket Exception!', description:'Service offline!\\nRestarting in 10 minutes...', url: '', color: colorRed})
				break;
			case 'wsDisconnect':
				content = format(webhookMessage, {title: 'Websocket Disconnected!', description:'Service offline!\\nRestarting in 10 minutes...', url: '', color: colorRed})
				break;
			case 'codeError':
				content = format(webhookMessage, {title: 'Code Exception!', description:'Service offline!\\nRestarting in 10 minutes...', url: '', color: colorRed})
				break;
			case 'fruit':
				targetChat = 'fruit'
				if (resourceLocations.get(fruitRecourceId) === undefined || resourceLocations.get(fruitRecourceId)?.size === 0) {
					content = format(webhookMessage, {title: "Traveler's Fruits", description:'**All fruits have been collected.**', url: '', color: colorYellow})
				} else {

					const fruits = resourceLocations.get(fruitRecourceId)
					if (!fruits) return;

					let desc = `> **Gatherable:** \`${fruits.size}\``
					let bmUrl = ''

					for (const fruit of fruits?.values()) {
						const [fX, fZ] = unpackLocation(fruit)
						bmUrl += `[${fX},${fZ}],`
						let near = undefined
						let dist = 99999
						
						for (const waystone of waystoneLocations.keys()) {
							const value = waystoneLocations.get(waystone);
							if (!value) continue;
							const [claimId, packedLocation] = value;
							const [wX, wZ] = unpackLocation(packedLocation)

							const wDist = Math.sqrt((fX - wX) ** 2 + (fZ - wZ) ** 2)
							if (wDist < dist) {
								dist = wDist
								near = claimsWithWaystones.get(claimId)
							}
						}
						desc += `\\n\`N: ${(fZ/3).toFixed(0)} | E: ${(fX/3).toFixed(0)}\` (Near **${near}**)`
					}
					bmUrl = bmUrl.slice(0,-1)
					
					content = format(webhookMessage, {title: "Traveler's Fruits", description: desc, url: fruitTrackerLink + format(fruitTrackerURIComponent, {coordinates: bmUrl}), color: colorGreen})
				}
				break
		}
	} else {
		targetChat = 'craft'
		let desc = ''
		if (data.empire) desc = `**Owner:** \`${data.owner}\`\\n**Empire:** \`${data.empire}\`\\n**Effort:** \`${data.effort.toLocaleString('en-US')}\` (Tier ${data.tier})\\n**Station:** \`${data.station}\`\\n**Location:** \`${data.location}\``
		else desc = `**Owner:** \`${data.owner}\`\\n**Effort:** \`${data.effort.toLocaleString('en-US')}\` (Tier ${data.tier})\\n**Station:** \`${data.station}\`\\n**Location:** \`${data.location}\``
		
		content = format(webhookMessage, {title: "Big Craft started!", description: desc, url: '', color: colorGreen})
	}

	if (targetChat == 'craft' || targetChat == 'all') {
		const response = await fetch(bigCraftWebhookLink!, { method: "POST", headers: { "Content-Type": "application/json" }, body: content })
		if (!response.ok) console.log(c.red(`<<< Failed to send Craft Webhook message: ${response.statusText}`))
		else console.log(c.green("<<< Crafting Webhook message posted"))
	}
	
	if (targetChat == 'fruit' || targetChat == 'all') {
		const response = await fetch(fruitTrackerWebhookLink!, { method: "POST", headers: { "Content-Type": "application/json" }, body: content })
		if (!response.ok) console.log(c.red(`<<< Failed to send Fruit Webhook message: ${response.statusText}`))
		else console.log(c.green("<<< Fruit Webhook message posted"))
	}
}

let shutdownTimer: NodeJS.Timeout | null = null;
export function scheduleShutdown() {
  if (shutdownTimer) return;
  console.log(c.red("Shutting down in 5 minutes..."));

  shutdownTimer = setTimeout(() => {
    console.log(c.red("Exiting process now."));
    process.exit(1);
  }, 5 * 60 * 1000);
}