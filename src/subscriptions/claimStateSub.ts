import { EventContext, BuildingState, ClaimState } from 'bitcraft_bindings';
import { claimsWithWaystones } from '../global.js';

export const ClaimStateInsert = (ctx: EventContext, row: ClaimState) => { 
    claimsWithWaystones.set(row.entityId.toString(), row.name)
}

export const ClaimStateDelete = (ctx: EventContext, row: ClaimState) => {
    claimsWithWaystones.delete(row.entityId.toString())
}