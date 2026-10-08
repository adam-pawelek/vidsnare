import type { en } from './locales/en'

export interface Plural {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/** Same shape as the English messages; plural leaves may use any categories. */
type Shape<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends { other: string } ? Plural : Shape<T[K]>
}

export type Messages = Shape<typeof en>

/** Dotted paths to every translatable string, e.g. `queue.status.failed`. */
export type MessageKey<T = typeof en, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends { other: string }
      ? `${Prefix}${K}`
      : MessageKey<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type Vars = Record<string, string | number>
