import { EventContext, EmpirePlayerDataState } from 'bitcraft_bindings';
import { empirePlayerData, empires } from '../global.js';

export const EmpirePlayerDataStateInsert = (ctx: EventContext, row: EmpirePlayerDataState) => {
    empirePlayerData.set(row.entityId.toString(), row.empireEntityId.toString())
}

export const EmpirePlayerDataStateDelete = (ctx: EventContext, row: EmpirePlayerDataState) => {
    empirePlayerData.delete(row.entityId.toString())
}