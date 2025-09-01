import { ConnectionId } from './connection_id.js';
import type { UpdateStatus } from './client_api/index.js';
import { Identity } from './identity.js';
import type { TableUpdate } from './table_cache.js';
import { Timestamp } from './timestamp.js';

export type InitialSubscriptionMessage = {
  tag: 'InitialSubscription';
  tableUpdates: TableUpdate[];
};

export type TransactionUpdateMessage = {
  tag: 'TransactionUpdate';
  tableUpdates: TableUpdate[];
  identity: Identity;
  connectionId: ConnectionId | null;
  reducerInfo?: {
    reducerName: string;
    args: Uint8Array;
  };
  status: UpdateStatus;
  message: string;
  timestamp: Timestamp;
  energyConsumed: bigint;
};

export type TransactionUpdateLightMessage = {
  tag: 'TransactionUpdateLight';
  tableUpdates: TableUpdate[];
};

export type IdentityTokenMessage = {
  tag: 'IdentityToken';
  identity: Identity;
  token: string;
  connectionId: ConnectionId;
};

export type SubscribeAppliedMessage = {
  tag: 'SubscribeApplied';
  queryId: number;
  tableUpdates: TableUpdate[];
};

export type UnsubscribeAppliedMessage = {
  tag: 'UnsubscribeApplied';
  queryId: number;
  tableUpdates: TableUpdate[];
};

export type SubscriptionError = {
  tag: 'SubscriptionError';
  queryId?: number;
  error: string;
};

export type Message =
  | InitialSubscriptionMessage
  | TransactionUpdateMessage
  | TransactionUpdateLightMessage
  | IdentityTokenMessage
  | SubscribeAppliedMessage
  | UnsubscribeAppliedMessage
  | SubscriptionError;
