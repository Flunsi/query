declare global {
	type Num1 = number      // Informativ für: 0..1   (float)
	type Num100 = number    // Informativ für: 0..100
	type Num255 = number    // Informativ für: 0..255
	type Num360 = number    // Informativ für: 0..360

	type StringOrNumber = string | number
	type StringObject = Record<string, string>
	type NumberObject = Record<string, number>
	type BooleanObject = Record<string, boolean>
	type UnknownObject = Record<string, unknown>
	type EmptyObject = Record<never, never>
	type StringOrNumberObject = Record<string, StringOrNumber>
}


export { }


