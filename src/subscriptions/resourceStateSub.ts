import { EventContext, ResourceState } from 'bitcraft_bindings/ts';
import { timeout, ResourceStateQueue, resourceLocations } from '../global'

export const ResourceStateInsert = (ctx: EventContext, row: ResourceState) => {
	const id = row.entityId.toString()
	ResourceStateQueue.set(id, row.resourceId)
}

export const ResourceStateDelete = (ctx: EventContext, row: ResourceState) => {
	ResourceStateQueue.delete(row.entityId.toString())
	const storedData = resourceLocations.get(row.resourceId)
	if (storedData) {
		storedData.delete(row.entityId.toString())
		resourceLocations.set(row.resourceId, storedData)
	}
}