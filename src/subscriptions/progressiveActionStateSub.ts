import { EventContext, ProgressiveActionState } from 'bitcraft_bindings';
import { craftingRecipes, dragonsHeadId, dragonsTailId, playerUsernames, sendWebhookMessage, CraftInfo, bigCraftThreshold, empirePlayerData, buildings, empires } from '../global.js';

export const ProgressiveActionStateInsert = (ctx: EventContext, row: ProgressiveActionState) => {
	if (ctx.event.tag === 'SubscribeApplied') return;							//? Ignore the initial sub reply

	const claimId = buildings.get(row.buildingEntityId.toString())
	if (!claimId) return														//? Isn't happening on the marked claims

	let location = undefined
	if (claimId === dragonsHeadId) location = 'Dragons Head'
	else if (claimId === dragonsTailId) location = 'Dragons Tail'
	if (!location)
		return																	//? Isn't happening in the marked claims
	
	const recipeInfo = craftingRecipes.get(row.recipeId.toString())
	if (!recipeInfo || (row.craftCount * recipeInfo[2]) <= bigCraftThreshold)
		return 																	//? Unknown craft (shouldn't happen) or too small
	
	const owner = playerUsernames.get(row.ownerEntityId.toString())
	if (!owner)
		return																	//? Unknown player (shouldn't happen)

	const effort = row.craftCount * recipeInfo[2]
	let empire = empirePlayerData.get(row.ownerEntityId.toString())
	if (empire) empire = empires.get(empire)
	if (!empire) empire = undefined
	const tier = recipeInfo[1]
	const station = recipeInfo[0]

	sendWebhookMessage({owner, empire, effort, tier, station, location} as CraftInfo)
}