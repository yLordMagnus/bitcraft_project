import type { DbContext } from './db_context.js';
import type { Event } from './event.js';
import type { ReducerEvent, ReducerInfoType } from './reducer_event.js';

export interface EventContextInterface<
  DBView = any,
  Reducers = any,
  SetReducerFlags = any,
  Reducer extends ReducerInfoType = never,
> extends DbContext<DBView, Reducers, SetReducerFlags> {
  /** Enum with variants for all possible events. */
  event: Event<Reducer>;
}

export interface ReducerEventContextInterface<
  DBView = any,
  Reducers = any,
  SetReducerFlags = any,
  Reducer extends ReducerInfoType = never,
> extends DbContext<DBView, Reducers, SetReducerFlags> {
  /** Enum with variants for all possible events. */
  event: ReducerEvent<Reducer>;
}

export interface SubscriptionEventContextInterface<
  DBView = any,
  Reducers = any,
  SetReducerFlags = any,
> extends DbContext<DBView, Reducers, SetReducerFlags> {
  /** No event is provided **/
}

export interface ErrorContextInterface<
  DBView = any,
  Reducers = any,
  SetReducerFlags = any,
> extends DbContext<DBView, Reducers, SetReducerFlags> {
  /** Enum with variants for all possible events. */
  event?: Error;
}
