type Success<T = unknown> = { data: T; error?: never }
type Failure<E = unknown> = { data?: never; error: E }
export type Result<T = unknown, E = unknown> = Success<T> | Failure<E>
