import { EventContext, EmpireState } from 'bitcraft_bindings/ts';
import { empires } from '../global';

export const EmpireStateInsert = (ctx: EventContext, row: EmpireState) => {
    empires.set(row.entityId.toString(), row.name)
}

export const EmpireStateDelete = (ctx: EventContext, row: EmpireState) => {
    empires.delete(row.entityId.toString())
}

export const EmpireStateUpdate = (ctx: EventContext, oldRow: EmpireState | undefined, newRow: EmpireState) => {
    empires.set(newRow.entityId.toString(), newRow.name)
}