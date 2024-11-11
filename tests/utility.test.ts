import { replacePlaceholderSql, escapeAll, escapeLiteral } from '../src/utility'
import type { StringOrNumberObject } from '../src/types'


describe('escapeLiteral', () => {
	test.each([
		{ data: "aaa'bbb", expected: "'aaa''bbb'" },
		{ data: "'aaa'", expected: "'''aaa'''" },
		{ data: "aaa\\bbb", expected: " E'aaa\\\\bbb'" },
		{ data: "\\aaa\\", expected: " E'\\\\aaa\\\\'" },
		{ data: "\\'\\'", expected: " E'\\\\''\\\\'''" },

	])('$data  =  $expected', ({ data, expected }) => {
		expect(escapeLiteral(data)).toEqual(expected)
	})

	test('toThrow', () => { expect(() => escapeLiteral(undefined as unknown as string)).toThrow() })
})


describe('escapeAll', () => {
	test.each([
		{ data: undefined, expected: undefined },

		{ data: 123, expected: 123 },
		{ data: 12.34, expected: 12.34 },

		{ data: '123', expected: "'123'" },
		{ data: 'abc', expected: "'abc'" },
		{ data: ['123', 'abc'], expected: ["'123'", "'abc'"] },

		{ data: { userId: 1, foodName: 'Broccoli' }, expected: { userId: 1, foodName: "'Broccoli'" } },
		{ data: { userId: 1, foodName: 'Broccoli', userName: 'Flunsi' }, expected: { userId: 1, foodName: "'Broccoli'", userName: "'Flunsi'" } },

		{ data: { foo: ['123', 'abc'] }, expected: { foo: ["'123'", "'abc'"] } },

	])('$data  =  $expected', ({ data, expected }) => {
		expect(escapeAll(data)).toEqual(expected)
	})
})


describe('replacePlaceholderSql', () => {
	test.each([
		{ text: "WHERE id = {id} AND name = {name}", values: { id: 1, name: "Flunsi's dog" }, expected: "WHERE id = 1 AND name = 'Flunsi''s dog'" },
		{ text: "WHERE id = {id} AND name = {name}", values: { id: 1, name: "Flunsi\\s dog" }, expected: "WHERE id = 1 AND name =  E'Flunsi\\\\s dog'" },
	])('$text  +  values  =  $expected', ({ text, values, expected }) => {
		expect(replacePlaceholderSql(text, values)).toEqual(expected)
	})

	// throw
	test.each<{ text: string, values: StringOrNumberObject }>([
		{ text: "WHERE id = {id} AND name = {name}", values: { id: 1, user: 2, name: "aaa" } }, 	// Zuviel Parameter übergeben
		{ text: "WHERE id = {id} AND name = {name}", values: { id: 1, } },							// Zuwenig Parameter übergeben
	])('$text  +  values', ({ text, values }) => {
		expect(() => replacePlaceholderSql(text, values)).toThrow()
	})
})
