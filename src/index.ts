import { DbConnection, ErrorContext } from 'bitcraft_bindings';
import { ErrorContextInterface, Identity } from "stdb_sdk";
import { LocationStateInsert, LocationStateDelete } from './subscriptions/locationStateSub.js'
import { ResourceStateInsert, ResourceStateDelete } from './subscriptions/resourceStateSub.js'
import { ProgressiveActionStateInsert } from './subscriptions/progressiveActionStateSub.js'
import { PlayerUsernameStateDelete, PlayerUsernameStateInsert, PlayerUsernameStateUpdate } from './subscriptions/playerUsernameStateSub.js'
import { BuildingStateDelete, BuildingStateInsert } from './subscriptions/buildingStateSub.js'
import { EmpirePlayerDataStateDelete, EmpirePlayerDataStateInsert } from './subscriptions/empirePlayerDataStateSub.js'
import { EmpireStateDelete, EmpireStateInsert, EmpireStateUpdate } from './subscriptions/empireStateSub.js'
import { ClaimStateDelete, ClaimStateInsert } from './subscriptions/claimStateSub.js'
import { dragonsHeadId, dragonsTailId, fruitRecourceId, loadBuildingDesc, waystoneBuildingId, loadRecipeDesc, sendWebhookMessage, scheduleShutdown } from './global.js'
import c from 'chalk'
import dotenv from 'dotenv'
dotenv.config();

try {
	const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
		const startTime = Date.now()
		setInterval(() => { if (global.gc) global.gc() }, 300000) // Call a GC every 5 minutes
		setTimeout(() => { if (global.gc) global.gc(); console.log(c.bold.cyan(`# Memory in first GC: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)}mb`))}, 10000) // Call a GC after 10 seconds

		loadBuildingDesc()
		loadRecipeDesc()

		console.log(c.green(`>>> Connected`))
		console.log(c.yellow(">>> Sending subscriptions"))
		conn.subscriptionBuilder()
			.onApplied(() => {
				dbc.db.claimState.onInsert(ClaimStateInsert)
				dbc.db.claimState.onDelete(ClaimStateDelete)

				dbc.db.resourceState.onInsert(ResourceStateInsert)
				dbc.db.resourceState.onDelete(ResourceStateDelete)

				dbc.db.locationState.onInsert(LocationStateInsert)
				dbc.db.locationState.onDelete(LocationStateDelete)

				dbc.db.playerUsernameState.onInsert(PlayerUsernameStateInsert)
				dbc.db.playerUsernameState.onDelete(PlayerUsernameStateDelete)
				dbc.db.playerUsernameState.onUpdate(PlayerUsernameStateUpdate)

				dbc.db.empireState.onInsert(EmpireStateInsert)
				dbc.db.empireState.onDelete(EmpireStateDelete)
				dbc.db.empireState.onUpdate(EmpireStateUpdate)

				dbc.db.empirePlayerDataState.onInsert(EmpirePlayerDataStateInsert)
				dbc.db.empirePlayerDataState.onDelete(EmpirePlayerDataStateDelete)

				dbc.db.buildingState.onInsert(BuildingStateInsert)
				dbc.db.buildingState.onDelete(BuildingStateDelete)

				dbc.db.progressiveActionState.onInsert(ProgressiveActionStateInsert)

				console.log(c.green(`<<< Subscribed [${Date.now()-startTime}ms]`))
				sendWebhookMessage('init')
				setTimeout(() => {sendWebhookMessage('fruit')}, 5000)
			})
			.onError((ctx: ErrorContextInterface) => console.log(c.red(`<<< Subscriptions failed:\n${ctx.event?.stack}`)))
			.subscribe([
				//? Fruit Tracker
				//* 1. Gets a list of all claim_state with a waystone (for claim ids and names)
				//* 2. Gets a list of all building_state of waystones (for their entity ids)
				//* 3. Gets a list of all location_state of waystones (compares entity ids to the building entity ids)
				//* 4. Gets a list of all resource_state of spawned fruits (is needed for the timeout to know if the location state is a waystone or a fruit 👀)
				//* 5. Gets a list of all location_state of spawned fruits (compares to the location of waystones to find the nearest one)
				//? Craft Tracker
				//* 1. Gets a list of all player_username_state (for player ids and names)
				//* 2. Gets a list of all empire_state (for empire ids and names)
				//* 3. Gets a list of all empire_player_data_state (to map player ids to empire ids)
				//* 4. Gets a list of all building_state in the marked claims (for their entity ids)
				//* 5. Gets a list of all public_progressive_action_state (uses all of the above)
				//?#################################################################################################################################################################
				`SELECT c.* FROM claim_state c JOIN building_state b ON c.entity_id=b.claim_entity_id WHERE b.building_description_id=${waystoneBuildingId};`,
				`SELECT b.* FROM claim_state c JOIN building_state b ON c.entity_id=b.claim_entity_id WHERE b.building_description_id=${waystoneBuildingId};`,
				`SELECT l.* FROM location_state l JOIN building_state b ON l.entity_id=b.entity_id WHERE b.building_description_id=${waystoneBuildingId} AND b.claim_entity_id!=0`,
				`SELECT r.* FROM resource_state r JOIN location_state l ON r.entity_id=l.entity_id WHERE r.resource_id=${fruitRecourceId};`,
				`SELECT l.* FROM resource_state r JOIN location_state l ON r.entity_id=l.entity_id WHERE r.resource_id=${fruitRecourceId};`,
				//?#################################################################################################################################################################
				'SELECT * FROM player_username_state',
				`SELECT * FROM empire_state;`,
				`SELECT * FROM empire_player_data_state;`,
				`SELECT * FROM building_state WHERE claim_entity_id=${dragonsHeadId} OR claim_entity_id=${dragonsTailId};`,
				'SELECT p.* FROM public_progressive_action_state pp JOIN progressive_action_state p ON p.entity_id=pp.entity_id;'
				//?#################################################################################################################################################################
			])
	}

	const onConnectError = (ctx: ErrorContext, error: Error) => {
		console.log(c.red(`<<< WebSocket Error:\n${ctx.event?.stack}`))
		sendWebhookMessage('wsError')
	}

	const onDisconnect = (ctx: ErrorContext, error?: Error) => {
		console.log(c.red(`<<< WebSocket Disconnected:\n${ctx.event?.stack}`))
		sendWebhookMessage('wsDisconnect')
	}

	const dbc = DbConnection.builder()
		.withUri(process.env.HOST as string)
		.withModuleName('bitcraft-5')
		.withToken(process.env.AUTH)
		.onConnect(onConnect)
		.onDisconnect(onDisconnect)
		.onConnectError(onConnectError)
		.withCompression('gzip')
		.withLightMode(true)
		.build()
} catch (error) {
	console.log(c.red(`>>> Code Error:\n${error}`))
	sendWebhookMessage('codeError')
	scheduleShutdown()
}

/**
 *! TODO
 *? Make it a discord bot
 *? Add a resource tracker (make a bitcraftmap.com link of a resource, using gist)
 *? Add a enemy tracker (same as above, but for herds)
 *? Add player profiles (can use ranking from bitjita api, since I lack access to other regions)
 *
 *! DONE
 ** Traveler's Fruit Tracker 
 ** Big Craft Tracker (Should add commands for the threshold to be set manually when it turns into a bot)
 */