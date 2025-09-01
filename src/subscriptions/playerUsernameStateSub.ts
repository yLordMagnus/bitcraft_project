import { EventContext, PlayerUsernameState } from 'bitcraft_bindings/ts';
import { playerUsernames } from '../global';

export const PlayerUsernameStateInsert = (ctx: EventContext, row: PlayerUsernameState) => {
    playerUsernames.set(row.entityId.toString(), row.username)
}

export const PlayerUsernameStateDelete = (ctx: EventContext, row: PlayerUsernameState) => {
    playerUsernames.delete(row.entityId.toString())
}

export const PlayerUsernameStateUpdate = (ctx: EventContext, oldRow: PlayerUsernameState | undefined, newRow: PlayerUsernameState) => {
    playerUsernames.set(newRow.entityId.toString(), newRow.username)
}