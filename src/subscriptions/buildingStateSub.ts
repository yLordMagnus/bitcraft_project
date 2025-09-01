import { EventContext, BuildingState } from 'bitcraft_bindings/ts';
import { buildings } from '../global';

export const BuildingStateInsert = (ctx: EventContext, row: BuildingState) => {
    buildings.set(row.entityId.toString(), row.claimEntityId.toString())
}

export const BuildingStateDelete = (ctx: EventContext, row: BuildingState) => {
    buildings.delete(row.entityId.toString())
}