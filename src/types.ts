// export type Num1 = number
// export type Num100 = number
// export type Num255 = number
// export type Num360 = number

export type StringOrNumber = string | number
// export type StringObject = Record<string, string>
// export type NumberObject = Record<string, number>
// export type BooleanObject = Record<string, boolean>
// export type UnknownObject = Record<string, unknown>
// export type EmptyObject = Record<never, never>
export type StringOrNumberObject = Record<string, StringOrNumber>
