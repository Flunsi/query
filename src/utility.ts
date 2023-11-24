import { isNumber, isObject, isString, undef, replacePlaceholder } from "@flunsi/utility"
import type { StringOrNumberObject } from './types'


export function replacePlaceholderSql(text: string, params?: StringOrNumberObject) {
	const valuesEscaped = escapeAll<StringOrNumberObject>(params)
	const textReplaced = replacePlaceholder(text, valuesEscaped, true)
	return textReplaced
}


export function escapeAll<Type>(data?: Type): Type {
	if (isNumber(data))
		return data
	else if (isString(data))
		return escapeLiteral(data) as Type
	else if (Array.isArray(data))
		return data.map((item) => escapeAll(item)) as Type	// recursion
	else if (isObject(data)) {
		const objKeys = Object.keys(data) as Array<keyof Type>
		const escapedObject: Type = {} as Type
		for (const key of objKeys)
			escapedObject[key] = escapeAll(data[key])		// recursion
		return escapedObject
	}
	else if (undef(data))
		return undefined as Type
	else
		throw new Error('ERROR_escapeAll: unkown Type')
}


export function escapeLiteral(str: string) {
	if (!isString(str))
		throw new Error('ERROR_escapeLiteral')

	let hasBackslash = false
	let escaped = "'"

	for (let i = 0; i < str.length; i++) {
		const c = str[i]
		if (c === "'") {
			escaped += c + c
		} else if (c === '\\') {
			escaped += c + c
			hasBackslash = true
		} else {
			escaped += c
		}
	}

	escaped += "'"

	if (hasBackslash === true)
		escaped = ' E' + escaped

	return escaped
}
