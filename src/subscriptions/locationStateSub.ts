import { EventContext, LocationState } from 'bitcraft_bindings';
import { LocationStateQueue, packLocation, timeout } from '../global.js'

export const LocationStateInsert = (ctx: EventContext, row: LocationState) => {
	const id = row.entityId.toString()
	LocationStateQueue.set(id, packLocation(row.x, row.z))
	timeout(id)
}

export const LocationStateDelete = (ctx: EventContext, row: LocationState) => {
	LocationStateQueue.delete(row.entityId.toString())
	// The ResourceState listener already handles the removal from the resourceLocations map.
}

export const LocationStateUpdate = (ctx: EventContext, oldRow: undefined, newRow: LocationState) => {
	const id = newRow.entityId.toString()
	LocationStateQueue.set(id, packLocation(newRow.x, newRow.z))
	timeout(id)
}