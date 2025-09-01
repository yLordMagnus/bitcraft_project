/**
 * A unique identifier for a client connected to a database.
 */
declare class ConnectionId {
    data: bigint;
    get __connection_id__(): bigint;
    /**
     * Creates a new `ConnectionId`.
     */
    constructor(data: bigint);
    isZero(): boolean;
    static nullIfZero(addr: ConnectionId): ConnectionId | null;
    static random(): ConnectionId;
    /**
     * Compare two connection IDs for equality.
     */
    isEqual(other: ConnectionId): boolean;
    /**
     * Print the connection ID as a hexadecimal string.
     */
    toHexString(): string;
    /**
     * Convert the connection ID to a Uint8Array.
     */
    toUint8Array(): Uint8Array;
    /**
     * Parse a connection ID from a hexadecimal string.
     */
    static fromString(str: string): ConnectionId;
    static fromStringOrNull(str: string): ConnectionId | null;
}

declare class BinaryReader {
    #private;
    constructor(input: Uint8Array);
    get offset(): number;
    readUInt8Array(): Uint8Array;
    readBool(): boolean;
    readByte(): number;
    readBytes(length: number): Uint8Array;
    readI8(): number;
    readU8(): number;
    readI16(): number;
    readU16(): number;
    readI32(): number;
    readU32(): number;
    readI64(): bigint;
    readU64(): bigint;
    readU128(): bigint;
    readI128(): bigint;
    readU256(): bigint;
    readI256(): bigint;
    readF32(): number;
    readF64(): number;
    readString(): string;
}

declare class BinaryWriter {
    #private;
    constructor(size: number);
    toBase64(): string;
    getBuffer(): Uint8Array;
    writeUInt8Array(value: Uint8Array): void;
    writeBool(value: boolean): void;
    writeByte(value: number): void;
    writeI8(value: number): void;
    writeU8(value: number): void;
    writeI16(value: number): void;
    writeU16(value: number): void;
    writeI32(value: number): void;
    writeU32(value: number): void;
    writeI64(value: bigint): void;
    writeU64(value: bigint): void;
    writeU128(value: bigint): void;
    writeI128(value: bigint): void;
    writeU256(value: bigint): void;
    writeI256(value: bigint): void;
    writeF32(value: number): void;
    writeF64(value: number): void;
    writeString(value: string): void;
}

/**
 * A variant of a sum type.
 *
 * NOTE: Each element has an implicit element tag based on its order.
 * Uniquely identifies an element similarly to protobuf tags.
 */
declare class SumTypeVariant {
    name: string;
    algebraicType: AlgebraicType;
    constructor(name: string, algebraicType: AlgebraicType);
}
/**
 * Unlike most languages, sums in SATS are *[structural]* and not nominal.
 * When checking whether two nominal types are the same,
 * their names and/or declaration sites (e.g., module / namespace) are considered.
 * Meanwhile, a structural type system would only check the structure of the type itself,
 * e.g., the names of its variants and their inner data types in the case of a sum.
 *
 * This is also known as a discriminated union (implementation) or disjoint union.
 * Another name is [coproduct (category theory)](https://ncatlab.org/nlab/show/coproduct).
 *
 * These structures are known as sum types because the number of possible values a sum
 * ```ignore
 * { N_0(T_0), N_1(T_1), ..., N_n(T_n) }
 * ```
 * is:
 * ```ignore
 * Σ (i ∈ 0..n). values(T_i)
 * ```
 * so for example, `values({ A(U64), B(Bool) }) = values(U64) + values(Bool)`.
 *
 * See also: https://ncatlab.org/nlab/show/sum+type.
 *
 * [structural]: https://en.wikipedia.org/wiki/Structural_type_system
 */
declare class SumType {
    variants: SumTypeVariant[];
    constructor(variants: SumTypeVariant[]);
    serialize: (writer: BinaryWriter, value: any) => void;
    deserialize: (reader: BinaryReader) => any;
}
/**
 * A factor / element of a product type.
 *
 * An element consist of an optional name and a type.
 *
 * NOTE: Each element has an implicit element tag based on its order.
 * Uniquely identifies an element similarly to protobuf tags.
 */
declare class ProductTypeElement {
    name: string;
    algebraicType: AlgebraicType;
    constructor(name: string, algebraicType: AlgebraicType);
}
/**
 * A structural product type  of the factors given by `elements`.
 *
 * This is also known as `struct` and `tuple` in many languages,
 * but note that unlike most languages, products in SATs are *[structural]* and not nominal.
 * When checking whether two nominal types are the same,
 * their names and/or declaration sites (e.g., module / namespace) are considered.
 * Meanwhile, a structural type system would only check the structure of the type itself,
 * e.g., the names of its fields and their types in the case of a record.
 * The name "product" comes from category theory.
 *
 * See also: https://ncatlab.org/nlab/show/product+type.
 *
 * These structures are known as product types because the number of possible values in product
 * ```ignore
 * { N_0: T_0, N_1: T_1, ..., N_n: T_n }
 * ```
 * is:
 * ```ignore
 * Π (i ∈ 0..n). values(T_i)
 * ```
 * so for example, `values({ A: U64, B: Bool }) = values(U64) * values(Bool)`.
 *
 * [structural]: https://en.wikipedia.org/wiki/Structural_type_system
 */
declare class ProductType {
    elements: ProductTypeElement[];
    constructor(elements: ProductTypeElement[]);
    isEmpty(): boolean;
    serialize: (writer: BinaryWriter, value: object) => void;
    intoMapKey(value: any): ComparablePrimitive;
    deserialize: (reader: BinaryReader) => {
        [key: string]: any;
    };
}
declare class MapType {
    keyType: AlgebraicType;
    valueType: AlgebraicType;
    constructor(keyType: AlgebraicType, valueType: AlgebraicType);
}
type ArrayBaseType = AlgebraicType;
type TypeRef = null;
type None = null;
type EnumLabel = {
    label: string;
};
type AnyType = ProductType | SumType | ArrayBaseType | MapType | EnumLabel | TypeRef | None;
type ComparablePrimitive = number | string | String | boolean | bigint;
/**
 * The SpacetimeDB Algebraic Type System (SATS) is a structural type system in
 * which a nominal type system can be constructed.
 *
 * The type system unifies the concepts sum types, product types, and built-in
 * primitive types into a single type system.
 */
declare class AlgebraicType {
    #private;
    type: Type;
    type_?: AnyType;
    get product(): ProductType;
    set product(value: ProductType | undefined);
    get sum(): SumType;
    set sum(value: SumType | undefined);
    get array(): ArrayBaseType;
    set array(value: ArrayBaseType | undefined);
    get map(): MapType;
    set map(value: MapType | undefined);
    static createProductType(elements: ProductTypeElement[]): AlgebraicType;
    static createSumType(variants: SumTypeVariant[]): AlgebraicType;
    static createArrayType(elementType: AlgebraicType): AlgebraicType;
    static createMapType(key: AlgebraicType, val: AlgebraicType): AlgebraicType;
    static createBoolType(): AlgebraicType;
    static createI8Type(): AlgebraicType;
    static createU8Type(): AlgebraicType;
    static createI16Type(): AlgebraicType;
    static createU16Type(): AlgebraicType;
    static createI32Type(): AlgebraicType;
    static createU32Type(): AlgebraicType;
    static createI64Type(): AlgebraicType;
    static createU64Type(): AlgebraicType;
    static createI128Type(): AlgebraicType;
    static createU128Type(): AlgebraicType;
    static createI256Type(): AlgebraicType;
    static createU256Type(): AlgebraicType;
    static createF32Type(): AlgebraicType;
    static createF64Type(): AlgebraicType;
    static createStringType(): AlgebraicType;
    static createBytesType(): AlgebraicType;
    static createOptionType(innerType: AlgebraicType): AlgebraicType;
    static createIdentityType(): AlgebraicType;
    static createConnectionIdType(): AlgebraicType;
    static createScheduleAtType(): AlgebraicType;
    static createTimestampType(): AlgebraicType;
    static createTimeDurationType(): AlgebraicType;
    isProductType(): boolean;
    isSumType(): boolean;
    isArrayType(): boolean;
    isMapType(): boolean;
    isIdentity(): boolean;
    isConnectionId(): boolean;
    isScheduleAt(): boolean;
    isTimestamp(): boolean;
    isTimeDuration(): boolean;
    /**
     * Convert a value of the algebraic type into something that can be used as a key in a map.
     * There are no guarantees about being able to order it.
     * This is only guaranteed to be comparable to other values of the same type.
     * @param value A value of the algebraic type
     * @returns Something that can be used as a key in a map.
     */
    intoMapKey(value: any): ComparablePrimitive;
    serialize(writer: BinaryWriter, value: any): void;
    deserialize(reader: BinaryReader): any;
}
declare namespace AlgebraicType {
    enum Type {
        SumType = "SumType",
        ProductType = "ProductType",
        ArrayType = "ArrayType",
        MapType = "MapType",
        Bool = "Bool",
        I8 = "I8",
        U8 = "U8",
        I16 = "I16",
        U16 = "U16",
        I32 = "I32",
        U32 = "U32",
        I64 = "I64",
        U64 = "U64",
        I128 = "I128",
        U128 = "U128",
        I256 = "I256",
        U256 = "U256",
        F32 = "F32",
        F64 = "F64",
        /** UTF-8 encoded */
        String = "String",
        None = "None"
    }
}
type Type = AlgebraicType.Type;
declare let Type: typeof AlgebraicType.Type;

/**
 * A unique identifier for a user connected to a database.
 */
declare class Identity {
    data: bigint;
    get __identity__(): bigint;
    /**
     * Creates a new `Identity`.
     *
     * `data` can be a hexadecimal string or a `bigint`.
     */
    constructor(data: string | bigint);
    /**
     * Compare two identities for equality.
     */
    isEqual(other: Identity): boolean;
    /**
     * Print the identity as a hexadecimal string.
     */
    toHexString(): string;
    /**
     * Convert the address to a Uint8Array.
     */
    toUint8Array(): Uint8Array;
    /**
     * Parse an Identity from a hexadecimal string.
     */
    static fromString(str: string): Identity;
}

declare namespace ScheduleAt {
    function getAlgebraicType(): AlgebraicType;
    type Interval = {
        tag: 'Interval';
        value: {
            __time_duration_micros__: BigInt;
        };
    };
    const Interval: (value: BigInt) => Interval;
    type Time = {
        tag: 'Time';
        value: {
            __timestamp_micros_since_unix_epoch__: BigInt;
        };
    };
    const Time: (value: BigInt) => Time;
    function fromValue(value: AlgebraicValue): ScheduleAt;
}
type ScheduleAt = ScheduleAt.Interval | ScheduleAt.Time;

interface ReducerArgsAdapter {
    next: () => ValueAdapter;
}
/** Defines the interface for deserialize `AlgebraicValue`s*/
interface ValueAdapter {
    readUInt8Array: () => Uint8Array;
    readArray: (type: AlgebraicType) => AlgebraicValue[];
    readMap: (keyType: AlgebraicType, valueType: AlgebraicType) => MapValue;
    readString: () => string;
    readSum: (type: SumType) => SumValue;
    readProduct: (type: ProductType) => ProductValue;
    readBool: () => boolean;
    readByte: () => number;
    readI8: () => number;
    readU8: () => number;
    readI16: () => number;
    readU16: () => number;
    readI32: () => number;
    readU32: () => number;
    readI64: () => bigint;
    readU64: () => bigint;
    readU128: () => bigint;
    readI128: () => bigint;
    readF32: () => number;
    readF64: () => number;
    callMethod<K extends keyof ValueAdapter>(methodName: K): any;
}
/** A value of a sum type choosing a specific variant of the type. */
declare class SumValue {
    /** A tag representing the choice of one variant of the sum type's variants. */
    tag: number;
    /**
     * Given a variant `Var(Ty)` in a sum type `{ Var(Ty), ... }`,
     * this provides the `value` for `Ty`.
     */
    value: AlgebraicValue;
    constructor(tag: number, value: AlgebraicValue);
    static deserialize(type: SumType, adapter: ValueAdapter): SumValue;
}
/**
 * A product value is made of a list of
 * "elements" / "fields" / "factors" of other `AlgebraicValue`s.
 *
 * The type of product value is a [product type](`ProductType`).
 */
declare class ProductValue {
    elements: AlgebraicValue[];
    constructor(elements: AlgebraicValue[]);
    static deserialize(type: ProductType, adapter: ValueAdapter): ProductValue;
}
type MapValue = Map<AlgebraicValue, AlgebraicValue>;
type AnyValue = SumValue | ProductValue | AlgebraicValue[] | Uint8Array | MapValue | string | boolean | number | bigint;
/** A value in SATS. */
declare class AlgebraicValue {
    value: AnyValue;
    constructor(value: AnyValue | undefined);
    callMethod<K extends keyof AlgebraicValue>(methodName: K): any;
    static deserialize(type: AlgebraicType, adapter: ValueAdapter): AlgebraicValue;
    asProductValue(): ProductValue;
    asField(index: number): AlgebraicValue;
    asSumValue(): SumValue;
    asArray(): AlgebraicValue[];
    asMap(): MapValue;
    asString(): string;
    asBoolean(): boolean;
    asNumber(): number;
    asBytes(): Uint8Array;
    asBigInt(): bigint;
    asIdentity(): Identity;
    asConnectionId(): ConnectionId;
    asScheduleAt(): ScheduleAt;
}

interface TableRuntimeTypeInfo {
    tableName: string;
    rowType: AlgebraicType;
    primaryKeyInfo?: PrimaryKeyInfo;
}
interface PrimaryKeyInfo {
    colName: string;
    colType: AlgebraicType;
}
interface ReducerRuntimeTypeInfo {
    reducerName: string;
    argsType: AlgebraicType;
}
interface RemoteModule {
    tables: {
        [name: string]: TableRuntimeTypeInfo;
    };
    reducers: {
        [name: string]: ReducerRuntimeTypeInfo;
    };
    eventContextConstructor: (imp: DbConnectionImpl, event: any) => any;
    dbViewConstructor: (connection: DbConnectionImpl) => any;
    reducersConstructor: (connection: DbConnectionImpl, setReducerFlags: any) => any;
    setReducerFlagsConstructor: () => any;
    versionInfo?: {
        cliVersion: string;
    };
}

declare class WebsocketDecompressAdapter {
    #private;
    onclose?: (...ev: any[]) => void;
    onopen?: (...ev: any[]) => void;
    onmessage?: (msg: {
        data: Uint8Array;
    }) => void;
    onerror?: (msg: ErrorEvent) => void;
    send(msg: any): void;
    close(): void;
    constructor(ws: WebSocket);
    static createWebSocketFn({ url, nameOrAddress, wsProtocol, authToken, compression, lightMode, }: {
        url: URL;
        wsProtocol: string;
        nameOrAddress: string;
        authToken?: string;
        compression: 'gzip' | 'none';
        lightMode: boolean;
    }): Promise<WebsocketDecompressAdapter>;
}

/**
 * The database client connection to a SpacetimeDB server.
 */
declare class DbConnectionBuilder<DbConnection, ErrorContext, SubscriptionEventContext> {
    #private;
    private remoteModule;
    private dbConnectionConstructor;
    /**
     * Creates a new `DbConnectionBuilder` database client and set the initial parameters.
     *
     * Users are not expected to call this constructor directly. Instead, use the static method `DbConnection.builder()`.
     *
     * @param remoteModule The remote module to use to connect to the SpacetimeDB server.
     * @param dbConnectionConstructor The constructor to use to create a new `DbConnection`.
     */
    constructor(remoteModule: RemoteModule, dbConnectionConstructor: (imp: DbConnectionImpl) => DbConnection);
    /**
     * Set the URI of the SpacetimeDB server to connect to.
     *
     * @param uri The URI of the SpacetimeDB server to connect to.
     *
     **/
    withUri(uri: string | URL): this;
    /**
     * Set the name or Identity of the database module to connect to.
     *
     * @param nameOrAddress
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withModuleName(nameOrAddress: string): this;
    /**
     * Set the identity of the client to connect to the database.
     *
     * @param token The credentials to use to authenticate with SpacetimeDB. This
     * is optional. You can store the token returned by the `onConnect` callback
     * to use in future connections.
     *
     * @returns The `DbConnectionBuilder` instance.
     */
    withToken(token?: string): this;
    withWSFn(createWSFn: (args: {
        url: URL;
        wsProtocol: string;
        authToken?: string;
    }) => Promise<WebsocketDecompressAdapter>): this;
    /**
     * Set the compression algorithm to use for the connection.
     *
     * @param compression The compression algorithm to use for the connection.
     */
    withCompression(compression: 'gzip' | 'none'): this;
    /**
     * Sets the connection to operate in light mode.
     *
     * Light mode is a mode that reduces the amount of data sent over the network.
     *
     * @param lightMode The light mode for the connection.
     */
    withLightMode(lightMode: boolean): this;
    /**
     * Register a callback to be invoked upon authentication with the database.
     *
     * @param identity A unique identifier for a client connected to a database.
     * @param token The credentials to use to authenticate with SpacetimeDB.
     *
     * @returns The `DbConnectionBuilder` instance.
     *
     * The callback will be invoked with the `Identity` and private authentication `token` provided by the database to identify this connection.
     *
     * If credentials were supplied to connect, those passed to the callback will be equivalent to the ones used to connect.
     *
     * If the initial connection was anonymous, a new set of credentials will be generated by the database to identify this user.
     *
     * The credentials passed to the callback can be saved and used to authenticate the same user in future connections.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnect((ctx, identity, token) => {
     *  console.log("Connected to SpacetimeDB with identity:", identity.toHexString());
     * });
     * ```
     */
    onConnect(callback: (connection: DbConnection, identity: Identity, token: string) => void): this;
    /**
     * Register a callback to be invoked upon an error.
     *
     * @example
     *
     * ```ts
     * DbConnection.builder().onConnectError((ctx, error) => {
     *   console.log("Error connecting to SpacetimeDB:", error);
     * });
     * ```
     */
    onConnectError(callback: (ctx: ErrorContext, error: Error) => void): this;
    /**
     * Registers a callback to run when a {@link DbConnection} whose connection initially succeeded
     * is disconnected, either after a {@link DbConnection.disconnect} call or due to an error.
     *
     * If the connection ended because of an error, the error is passed to the callback.
     *
     * The `callback` will be installed on the `DbConnection` created by `build`
     * before initiating the connection, ensuring there's no opportunity for the disconnect to happen
     * before the callback is installed.
     *
     * Note that this does not trigger if `build` fails
     * or in cases where {@link DbConnectionBuilder.onConnectError} would trigger.
     * This callback only triggers if the connection closes after `build` returns successfully
     * and {@link DbConnectionBuilder.onConnect} is invoked, i.e., after the `IdentityToken` is received.
     *
     * To simplify SDK implementation, at most one such callback can be registered.
     * Calling `onDisconnect` on the same `DbConnectionBuilder` multiple times throws an error.
     *
     * Unlike callbacks registered via {@link DbConnection},
     * no mechanism is provided to unregister the provided callback.
     * This is a concession to ergonomics; there's no clean place to return a `CallbackId` from this method
     * or from `build`.
     *
     * @param {function(error?: Error): void} callback - The callback to invoke upon disconnection.
     * @throws {Error} Throws an error if called multiple times on the same `DbConnectionBuilder`.
     */
    onDisconnect(callback: (ctx: ErrorContext, error?: Error | undefined) => void): this;
    /**
     * Builds a new `DbConnection` with the parameters set on this `DbConnectionBuilder` and attempts to connect to the SpacetimeDB server.
     *
     * @returns A new `DbConnection` with the parameters set on this `DbConnectionBuilder`.
     *
     * @example
     *
     * ```ts
     * const host = "http://localhost:3000";
     * const name_or_address = "database_name"
     * const auth_token = undefined;
     * DbConnection.builder().withUri(host).withModuleName(name_or_address).withToken(auth_token).build();
     * ```
     */
    build(): DbConnection;
}

/**
 * A point in time, represented as a number of microseconds since the Unix epoch.
 */
declare class Timestamp {
    __timestamp_micros_since_unix_epoch__: bigint;
    private static MICROS_PER_MILLIS;
    get microsSinceUnixEpoch(): bigint;
    constructor(micros: bigint);
    /**
     * The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
     */
    static UNIX_EPOCH: Timestamp;
    /**
     * Get a `Timestamp` representing the execution environment's belief of the current moment in time.
     */
    static now(): Timestamp;
    /**
     * Get a `Timestamp` representing the same point in time as `date`.
     */
    static fromDate(date: Date): Timestamp;
    /**
     * Get a `Date` representing approximately the same point in time as `this`.
     *
     * This method truncates to millisecond precision,
     * and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
     */
    toDate(): Date;
}

declare namespace RowSizeHint {
    type FixedSize = {
        tag: 'FixedSize';
        value: number;
    };
    type RowOffsets = {
        tag: 'RowOffsets';
        value: bigint[];
    };
    const FixedSize: (value: number) => RowSizeHint;
    const RowOffsets: (value: bigint[]) => RowSizeHint;
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: RowSizeHint): void;
    function deserialize(reader: BinaryReader): RowSizeHint;
}
type RowSizeHint = RowSizeHint.FixedSize | RowSizeHint.RowOffsets;

type BsatnRowList = {
    sizeHint: RowSizeHint;
    rowsData: Uint8Array;
};
/**
 * A namespace for generated helper functions.
 */
declare namespace BsatnRowList {
    /**
     * A function which returns this type represented as an AlgebraicType.
     * This function is derived from the AlgebraicType used to generate this type.
     */
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: BsatnRowList): void;
    function deserialize(reader: BinaryReader): BsatnRowList;
}

type QueryUpdate = {
    deletes: BsatnRowList;
    inserts: BsatnRowList;
};
/**
 * A namespace for generated helper functions.
 */
declare namespace QueryUpdate {
    /**
     * A function which returns this type represented as an AlgebraicType.
     * This function is derived from the AlgebraicType used to generate this type.
     */
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: QueryUpdate): void;
    function deserialize(reader: BinaryReader): QueryUpdate;
}

declare namespace CompressableQueryUpdate {
    type Uncompressed = {
        tag: 'Uncompressed';
        value: QueryUpdate;
    };
    type Brotli = {
        tag: 'Brotli';
        value: Uint8Array;
    };
    type Gzip = {
        tag: 'Gzip';
        value: Uint8Array;
    };
    const Uncompressed: (value: QueryUpdate) => CompressableQueryUpdate;
    const Brotli: (value: Uint8Array) => CompressableQueryUpdate;
    const Gzip: (value: Uint8Array) => CompressableQueryUpdate;
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: CompressableQueryUpdate): void;
    function deserialize(reader: BinaryReader): CompressableQueryUpdate;
}
type CompressableQueryUpdate = CompressableQueryUpdate.Uncompressed | CompressableQueryUpdate.Brotli | CompressableQueryUpdate.Gzip;

type TableUpdate$1 = {
    tableId: number;
    tableName: string;
    numRows: bigint;
    updates: CompressableQueryUpdate[];
};
/**
 * A namespace for generated helper functions.
 */
declare namespace TableUpdate$1 {
    /**
     * A function which returns this type represented as an AlgebraicType.
     * This function is derived from the AlgebraicType used to generate this type.
     */
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: TableUpdate$1): void;
    function deserialize(reader: BinaryReader): TableUpdate$1;
}

type DatabaseUpdate = {
    tables: TableUpdate$1[];
};
/**
 * A namespace for generated helper functions.
 */
declare namespace DatabaseUpdate {
    /**
     * A function which returns this type represented as an AlgebraicType.
     * This function is derived from the AlgebraicType used to generate this type.
     */
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: DatabaseUpdate): void;
    function deserialize(reader: BinaryReader): DatabaseUpdate;
}

declare namespace UpdateStatus {
    type Committed = {
        tag: 'Committed';
        value: DatabaseUpdate;
    };
    type Failed = {
        tag: 'Failed';
        value: string;
    };
    type OutOfEnergy = {
        tag: 'OutOfEnergy';
    };
    const Committed: (value: DatabaseUpdate) => UpdateStatus;
    const Failed: (value: string) => UpdateStatus;
    const OutOfEnergy: {
        tag: string;
    };
    function getTypeScriptAlgebraicType(): AlgebraicType;
    function serialize(writer: BinaryWriter, value: UpdateStatus): void;
    function deserialize(reader: BinaryReader): UpdateStatus;
}
type UpdateStatus = UpdateStatus.Committed | UpdateStatus.Failed | UpdateStatus.OutOfEnergy;

type ReducerInfoType = {
    name: string;
    args?: any;
} | never;
type ReducerEvent<Reducer extends ReducerInfoType> = {
    /**
     * The time when the reducer started running.
     *
     * @internal This is a number and not Date, as JSON.stringify with date in it gives number, but JSON.parse of the same string does not give date. TO avoid
     * confusion in typing we'll keep it a number
     */
    timestamp: Timestamp;
    /**
     * Whether the reducer committed, was aborted due to insufficient energy, or failed with an error message.
     */
    status: UpdateStatus;
    /**
     * The identity of the caller.
     * TODO: Revise these to reflect the forthcoming Identity proposal.
     */
    callerIdentity: Identity;
    /**
     * The connection ID of the caller.
     *
     * May be `null`, e.g. for scheduled reducers.
     */
    callerConnectionId?: ConnectionId;
    /**
     * The amount of energy consumed by the reducer run, in eV.
     * (Not literal eV, but our SpacetimeDB energy unit eV.)
     * May be present or undefined at the implementor's discretion;
     * future work may determine an interface for module developers
     * to request this value be published or hidden.
     */
    energyConsumed?: bigint;
    reducer: Reducer;
};

type Event<Reducer extends ReducerInfoType> = {
    tag: 'Reducer';
    value: ReducerEvent<Reducer>;
} | {
    tag: 'SubscribeApplied';
} | {
    tag: 'UnsubscribeApplied';
} | {
    tag: 'Error';
    value: Error;
} | {
    tag: 'UnknownTransaction';
};

interface EventContextInterface<DBView = any, Reducers = any, SetReducerFlags = any, Reducer extends ReducerInfoType = never> extends DbContext<DBView, Reducers, SetReducerFlags> {
    /** Enum with variants for all possible events. */
    event: Event<Reducer>;
}
interface ReducerEventContextInterface<DBView = any, Reducers = any, SetReducerFlags = any, Reducer extends ReducerInfoType = never> extends DbContext<DBView, Reducers, SetReducerFlags> {
    /** Enum with variants for all possible events. */
    event: ReducerEvent<Reducer>;
}
interface SubscriptionEventContextInterface<DBView = any, Reducers = any, SetReducerFlags = any> extends DbContext<DBView, Reducers, SetReducerFlags> {
}
interface ErrorContextInterface<DBView = any, Reducers = any, SetReducerFlags = any> extends DbContext<DBView, Reducers, SetReducerFlags> {
    /** Enum with variants for all possible events. */
    event?: Error;
}

declare class EventEmitter<Key, Callback extends Function = Function> {
    #private;
    on(event: Key, callback: Callback): void;
    off(event: Key, callback: Callback): void;
    emit(event: Key, ...args: any[]): void;
}

declare class SubscriptionBuilderImpl<DBView = any, Reducers = any, SetReducerFlags = any> {
    #private;
    private db;
    constructor(db: DbConnectionImpl<DBView, Reducers, SetReducerFlags>);
    /**
     * Registers `callback` to run when this query is successfully added to our subscribed set,
     * I.e. when its `SubscriptionApplied` message is received.
     *
     * The database state exposed via the `&EventContext` argument
     * includes all the rows added to the client cache as a result of the new subscription.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeApplied`.
     *
     * Multiple `on_applied` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_applied` callbacks is exposed.
     *
     * @param cb - Callback to run when the subscription is applied.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onApplied(cb: (ctx: SubscriptionEventContextInterface<DBView, Reducers, SetReducerFlags>) => void): SubscriptionBuilderImpl<DBView, Reducers, SetReducerFlags>;
    /**
     * Registers `callback` to run when this query either:
     * - Fails to be added to our subscribed set.
     * - Is unexpectedly removed from our subscribed set.
     *
     * If the subscription had previously started and has been unexpectedly removed,
     * the database state exposed via the `&EventContext` argument contains no rows
     * from any subscriptions removed within the same error event.
     * As proposed, it must therefore contain no rows.
     *
     * The event in the `&EventContext` argument is `Event::SubscribeError`,
     * containing a dynamic error object with a human-readable description of the error
     * for diagnostic purposes.
     *
     * Multiple `on_error` callbacks for the same query may coexist.
     * No mechanism for un-registering `on_error` callbacks is exposed.
     *
     * @param cb - Callback to run when there is an error in subscription.
     * @returns The current `SubscriptionBuilder` instance.
     */
    onError(cb: (ctx: ErrorContextInterface<DBView, Reducers, SetReducerFlags>) => void): SubscriptionBuilderImpl<DBView, Reducers, SetReducerFlags>;
    /**
     * Subscribe to a single query. The results of the query will be merged into the client
     * cache and deduplicated on the client.
     *
     * @param query_sql A `SQL` query to subscribe to.
     *
     * @example
     *
     * ```ts
     * const subscription = connection.subscriptionBuilder().onApplied(() => {
     *   console.log("SDK client cache initialized.");
     * }).subscribe("SELECT * FROM User");
     *
     * subscription.unsubscribe();
     * ```
     */
    subscribe(query_sql: string | string[]): SubscriptionHandleImpl<DBView, Reducers, SetReducerFlags>;
    /**
     * Subscribes to all rows from all tables.
     *
     * This method is intended as a convenience
     * for applications where client-side memory use and network bandwidth are not concerns.
     * Applications where these resources are a constraint
     * should register more precise queries via `subscribe`
     * in order to replicate only the subset of data which the client needs to function.
     *
     * This method should not be combined with `subscribe` on the same `DbConnection`.
     * A connection may either `subscribe` to particular queries,
     * or `subscribeToAllTables`, but not both.
     * Attempting to call `subscribe`
     * on a `DbConnection` that has previously used `subscribeToAllTables`,
     * or vice versa, may misbehave in any number of ways,
     * including dropping subscriptions, corrupting the client cache, or throwing errors.
     */
    subscribeToAllTables(): void;
}
type SubscribeEvent = 'applied' | 'error' | 'end';
declare class SubscriptionHandleImpl<DBView = any, Reducers = any, SetReducerFlags = any> {
    #private;
    private db;
    constructor(db: DbConnectionImpl<DBView, Reducers, SetReducerFlags>, querySql: string[], onApplied?: (ctx: SubscriptionEventContextInterface<DBView, Reducers, SetReducerFlags>) => void, onError?: (ctx: ErrorContextInterface<DBView, Reducers, SetReducerFlags>, error: Error) => void);
    /**
     * Consumes self and issues an `Unsubscribe` message,
     * removing this query from the client's set of subscribed queries.
     * It is only valid to call this method if `is_active()` is `true`.
     */
    unsubscribe(): void;
    /**
     * Unsubscribes and also registers a callback to run upon success.
     * I.e. when an `UnsubscribeApplied` message is received.
     *
     * If `Unsubscribe` returns an error,
     * or if the `on_error` callback(s) are invoked before this subscription would end normally,
     * the `on_end` callback is not invoked.
     *
     * @param onEnd - Callback to run upon successful unsubscribe.
     */
    unsubscribeThen(onEnd: (ctx: SubscriptionEventContextInterface<DBView, Reducers, SetReducerFlags>) => void): void;
    /**
     * True if this `SubscriptionHandle` has ended,
     * either due to an error or a call to `unsubscribe`.
     *
     * This is initially false, and becomes true when either the `on_end` or `on_error` callback is invoked.
     * A subscription which has not yet been applied is not active, but is also not ended.
     */
    isEnded(): boolean;
    /**
     * True if this `SubscriptionHandle` is active, meaning it has been successfully applied
     * and has not since ended, either due to an error or a complete `unsubscribe` request-response pair.
     *
     * This corresponds exactly to the interval bounded at the start by the `on_applied` callback
     * and at the end by either the `on_end` or `on_error` callback.
     */
    isActive(): boolean;
}

/**
 * Interface representing a database context.
 *
 * @template DBView - Type representing the database view.
 * @template Reducers - Type representing the reducers.
 * @template SetReducerFlags - Type representing the reducer flags collection.
 */
interface DbContext<DBView = any, Reducers = any, SetReducerFlags = any> {
    db: DBView;
    reducers: Reducers;
    setReducerFlags: SetReducerFlags;
    isActive: boolean;
    /**
     * Creates a new subscription builder.
     *
     * @returns The subscription builder.
     */
    subscriptionBuilder(): SubscriptionBuilderImpl<DBView, Reducers, SetReducerFlags>;
    /**
     * Disconnects from the database.
     */
    disconnect(): void;
}

type Operation = {
    type: 'insert' | 'delete';
    rowId: ComparablePrimitive;
    row: any;
};
type TableUpdate = {
    tableName: string;
    operations: Operation[];
};
type PendingCallback = {
    type: 'insert' | 'delete' | 'update';
    table: string;
    cb: () => void;
};
/**
 * Builder to generate calls to query a `table` in the database
 */
declare class TableCache<RowType = any> {
    private rows;
    private tableTypeInfo;
    private emitter;
    /**
     * @param name the table name
     * @param primaryKeyCol column index designated as `#[primarykey]`
     * @param primaryKey column name designated as `#[primarykey]`
     * @param entityClass the entityClass
     */
    constructor(tableTypeInfo: TableRuntimeTypeInfo);
    /**
     * @returns number of rows in the table
     */
    count(): number;
    /**
     * @returns The values of the rows in the table
     */
    iter(): any[];
    applyOperations: (operations: Operation[], ctx: EventContextInterface) => PendingCallback[];
    update: (ctx: EventContextInterface, rowId: ComparablePrimitive, newRow: RowType, refCountDelta?: number) => PendingCallback | undefined;
    insert: (ctx: EventContextInterface, operation: Operation, count?: number) => PendingCallback | undefined;
    delete: (ctx: EventContextInterface, operation: Operation, count?: number) => PendingCallback | undefined;
    /**
     * Register a callback for when a row is newly inserted into the database.
     *
     * ```ts
     * User.onInsert((user, reducerEvent) => {
     *   if (reducerEvent) {
     *      console.log("New user on reducer", reducerEvent, user);
     *   } else {
     *      console.log("New user received during subscription update on insert", user);
     *  }
     * });
     * ```
     *
     * @param cb Callback to be called when a new row is inserted
     */
    onInsert: <EventContext>(cb: (ctx: EventContext, row: RowType) => void) => void;
    /**
     * Register a callback for when a row is deleted from the database.
     *
     * ```ts
     * User.onDelete((user, reducerEvent) => {
     *   if (reducerEvent) {
     *      console.log("Deleted user on reducer", reducerEvent, user);
     *   } else {
     *      console.log("Deleted user received during subscription update on update", user);
     *  }
     * });
     * ```
     *
     * @param cb Callback to be called when a new row is inserted
     */
    onDelete: <EventContext>(cb: (ctx: EventContext, row: RowType) => void) => void;
    /**
     * Register a callback for when a row is updated into the database.
     *
     * ```ts
     * User.onInsert((user, reducerEvent) => {
     *   if (reducerEvent) {
     *      console.log("Updated user on reducer", reducerEvent, user);
     *   } else {
     *      console.log("Updated user received during subscription update on delete", user);
     *  }
     * });
     * ```
     *
     * @param cb Callback to be called when a new row is inserted
     */
    onUpdate: <EventContext>(cb: (ctx: EventContext, oldRow: undefined, row: RowType) => void) => void;
    /**
     * Remove a callback for when a row is newly inserted into the database.
     *
     * @param cb Callback to be removed
     */
    removeOnInsert: <EventContext>(cb: (ctx: EventContext, row: RowType) => void) => void;
    /**
     * Remove a callback for when a row is deleted from the database.
     *
     * @param cb Callback to be removed
     */
    removeOnDelete: <EventContext>(cb: (ctx: EventContext, row: RowType) => void) => void;
    /**
     * Remove a callback for when a row is updated into the database.
     *
     * @param cb Callback to be removed
     */
    removeOnUpdate: <EventContext>(cb: (ctx: EventContext, oldRow: undefined, row: RowType) => void) => void;
}

declare function deepEqual(obj1: any, obj2: any): boolean;

type ConnectionEvent = 'connect' | 'disconnect' | 'connectError';
type CallReducerFlags = 'FullUpdate' | 'NoSuccessNotify';
type ReducerEventCallback<ReducerArgs extends any[] = any[]> = (ctx: ReducerEventContextInterface, ...args: ReducerArgs) => void;
type SubscriptionEventCallback = (ctx: SubscriptionEventContextInterface) => void;
type DbConnectionConfig = {
    uri: URL;
    nameOrAddress: string;
    identity?: Identity;
    token?: string;
    emitter: EventEmitter<ConnectionEvent>;
    remoteModule: RemoteModule;
    createWSFn: typeof WebsocketDecompressAdapter.createWebSocketFn;
    compression: 'gzip' | 'none';
    lightMode: boolean;
};
declare class DbConnectionImpl<DBView = any, Reducers = any, SetReducerFlags = any> implements DbContext<DBView, Reducers> {
    #private;
    /**
     * Whether or not the connection is active.
     */
    isActive: boolean;
    /**
     * This connection's public identity.
     */
    identity?: Identity;
    /**
     * This connection's private authentication token.
     */
    token?: string;
    /**
     * The accessor field to access the tables in the database and associated
     * callback functions.
     */
    db: DBView;
    /**
     * The accessor field to access the reducers in the database and associated
     * callback functions.
     */
    reducers: Reducers;
    /**
     * The accessor field to access functions related to setting flags on
     * reducers regarding how the server should handle the reducer call and
     * the events that it sends back to the client.
     */
    setReducerFlags: SetReducerFlags;
    /**
     * The `ConnectionId` of the connection to to the database.
     */
    connectionId: ConnectionId;
    private clientCache;
    private ws?;
    private wsPromise;
    constructor({ uri, nameOrAddress, identity, token, emitter, remoteModule, createWSFn, compression, lightMode, }: DbConnectionConfig);
    subscriptionBuilder: () => SubscriptionBuilderImpl;
    registerSubscription(handle: SubscriptionHandleImpl<DBView, Reducers, SetReducerFlags>, handleEmitter: EventEmitter<SubscribeEvent, SubscriptionEventCallback>, querySql: string[]): number;
    unregisterSubscription(queryId: number): void;
    /**
     * Call a reducer on your SpacetimeDB module.
     *
     * @param reducerName The name of the reducer to call
     * @param argsSerializer The arguments to pass to the reducer
     */
    callReducer(reducerName: string, argsBuffer: Uint8Array, flags: CallReducerFlags): void;
    /**
     * Close the current connection.
     *
     * @example
     *
     * ```ts
     * const connection = DbConnection.builder().build();
     * connection.disconnect()
     * ```
     */
    disconnect(): void;
    onReducer(reducerName: string, callback: ReducerEventCallback): void;
    offReducer(reducerName: string, callback: ReducerEventCallback): void;
}

declare class ClientCache {
    /**
     * The tables in the database.
     */
    tables: Map<string, TableCache>;
    constructor();
    /**
     * Returns the table with the given name.
     * @param name The name of the table.
     * @returns The table
     */
    getTable(name: string): TableCache;
    getOrCreateTable<RowType>(tableTypeInfo: TableRuntimeTypeInfo): TableCache<RowType>;
}

type InitialSubscriptionMessage = {
    tag: 'InitialSubscription';
    tableUpdates: TableUpdate[];
};
type TransactionUpdateMessage = {
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
type TransactionUpdateLightMessage = {
    tag: 'TransactionUpdateLight';
    tableUpdates: TableUpdate[];
};
type IdentityTokenMessage = {
    tag: 'IdentityToken';
    identity: Identity;
    token: string;
    connectionId: ConnectionId;
};
type SubscribeAppliedMessage = {
    tag: 'SubscribeApplied';
    queryId: number;
    tableUpdates: TableUpdate[];
};
type UnsubscribeAppliedMessage = {
    tag: 'UnsubscribeApplied';
    queryId: number;
    tableUpdates: TableUpdate[];
};
type SubscriptionError = {
    tag: 'SubscriptionError';
    queryId?: number;
    error: string;
};
type Message = InitialSubscriptionMessage | TransactionUpdateMessage | TransactionUpdateLightMessage | IdentityTokenMessage | SubscribeAppliedMessage | UnsubscribeAppliedMessage | SubscriptionError;

/**
 * A difference between two points in time, represented as a number of microseconds.
 */
declare class TimeDuration {
    __time_duration_micros__: bigint;
    private static MICROS_PER_MILLIS;
    get micros(): bigint;
    get millis(): number;
    constructor(micros: bigint);
    static fromMillis(millis: number): TimeDuration;
}

export { AlgebraicType, AlgebraicValue, BinaryReader, BinaryWriter, type CallReducerFlags, ClientCache, type ConnectionEvent, ConnectionId, DbConnectionBuilder, DbConnectionImpl, type DbContext, type ErrorContextInterface, type Event, type EventContextInterface, Identity, type IdentityTokenMessage, type InitialSubscriptionMessage, type Message, ProductType, ProductTypeElement, ProductValue, type ReducerArgsAdapter, type ReducerEvent, type ReducerEventContextInterface, ScheduleAt, type SubscribeAppliedMessage, SubscriptionBuilderImpl, type SubscriptionError, type SubscriptionEventContextInterface, SumType, SumTypeVariant, TableCache, TimeDuration, Timestamp, type TransactionUpdateLightMessage, type TransactionUpdateMessage, type UnsubscribeAppliedMessage, type ValueAdapter, deepEqual };
