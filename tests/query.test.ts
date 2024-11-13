import { Db } from '../src/db'
import 'dotenv/config'


const db = new Db({
	connectionString: process.env.DB_URL,
	connectionTimeoutMillis: 10000,
	idleTimeoutMillis: 10000,
})


// ACHTUNG, ALLE Tests laufen parallel, trotz maxConcurrency = 1
// Deshalb braucht jedes Test-File eine eigene Tabelle
beforeAll(async () => {
	await db.query.update(`DROP TABLE IF EXISTS "vitest_query"`)
	await db.query.update(
		`CREATE TABLE "vitest_query" (
		"id" SERIAL PRIMARY KEY,
		"f1" int2 NOT NULL DEFAULT 0,
		"f2" int2 NOT NULL DEFAULT 0,
		"f3" int2 NOT NULL DEFAULT 0)`)
})


afterAll(async () => {
	await db.query.update(`DROP TABLE IF EXISTS "vitest_query"`)
})


//  id   f1   f2   f3
//  =================
//   1  111  222  333
//   2  444  555  666
//   3  777  888  999

describe('query: queryRows, queryRow, queryCell, queryUpdate', async () => {
	// Inserting rows and testing auto-increment
	const statement = 'INSERT INTO vitest_query (f1, f2, f3) VALUES ({f1}, {f2}, {f3}) returning id'
	test.each([
		{ params: { f1: 111, f2: 222, f3: 333 }, expected: 1 },
		{ params: { f1: 444, f2: 555, f3: 666 }, expected: 2 },
		{ params: { f1: 777, f2: 888, f3: 999 }, expected: 3 },
	])('$params  =  $expected', async ({ params, expected }) => {
		expect((await db.query.field(statement, params))).toEqual(expected)
	})


	// query.field
	const statementForField = 'SELECT f2 FROM vitest_query WHERE id = {id}'
	test('query.field', async () => {
		const myNum = await db.query.field<number>(statementForField, { id: 2 })
		expect(myNum).toEqual(555)
	})

	// query.field with no result
	test('query.field with no result', async () => {
		const myNum = await db.query.field<number>(statementForField, { id: 999 })
		expect(myNum).toEqual(undefined)
	})

	// query.field with multiple results and raiseErrorOnMultipleRows = true
	test('query.field with multiple results and raiseErrorOnMultipleRows', async () => {
		await expect(async () => { await db.query.field('SELECT f1 FROM vitest_query', undefined, true) }).rejects.toThrow()
	})


	// query.row
	const statementForRow = 'SELECT id, f1 FROM vitest_query WHERE id = {id}'
	test('query.row', async () => {
		const myObj = await db.query.row(statementForRow, { id: 2 })
		expect(myObj).toEqual({ id: 2, f1: 444 })
	})

	// query.row with no result
	test('query.row with no result', async () => {
		const myObj = await db.query.row(statementForRow, { id: 999 })
		expect(myObj).toEqual(undefined)
	})

	// query.row with multiple results and raiseErrorOnMultipleRows = true
	test('query.row with multiple results and raiseErrorOnMultipleRows', async () => {
		await expect(async () => { await db.query.row('SELECT id, f1 FROM vitest_query', undefined, true) }).rejects.toThrow()
	})


	// query.rowAsArray
	const statementForRowAsArray = 'SELECT id, f1, f2 FROM vitest_query WHERE id = {id}'
	test('query.rowAsArray', async () => {
		const myAry = await db.query.rowAsArray(statementForRowAsArray, { id: 2 })
		expect(myAry).toEqual([2, 444, 555])
	})

	// query.rowAsArray with no result
	test('query.rowAsArray with no result', async () => {
		const myAry = await db.query.rowAsArray(statementForRowAsArray, { id: 999 })
		expect(myAry).toEqual(undefined)
	})

	// query.row with multiple results and raiseErrorOnMultipleRows = true
	test('query.rowAsArray with multiple results and raiseErrorOnMultipleRows', async () => {
		await expect(async () => { await db.query.rowAsArray('SELECT id, f1 FROM vitest_query', undefined, true) }).rejects.toThrow()
	})



	// query.rows
	const statementForRows = 'SELECT id, f1 FROM vitest_query WHERE id >= {id}'
	test('query.rows', async () => {
		const myAry = await db.query.rows(statementForRows, { id: 2 })
		expect(myAry).toEqual([{ id: 2, f1: 444 }, { id: 3, f1: 777 }])
	})

	// query.rows with no result
	test('query.rows with no result', async () => {
		const myAry = await db.query.rows(statementForRows, { id: 999 })
		expect(myAry).toEqual([])
	})


	// query.columnAsArray
	const statementForColumnAsArray = 'SELECT f1 FROM vitest_query WHERE id <= {id}'
	test('query.columnAsArray', async () => {
		const myAry = await db.query.columnAsArray(statementForColumnAsArray, { id: 3 })
		expect(myAry).toEqual([111, 444, 777])
	})

	// query.columnAsArray with no result
	test('query.columnAsArray with no result', async () => {
		const myAry = await db.query.columnAsArray(statementForColumnAsArray, { id: 0 })
		expect(myAry).toEqual([])
	})


	// query.update / rowCount
	test('query.update / rowCount', async () => {
		const rowCount = await db.query.update('UPDATE vitest_query SET f3 = 69 WHERE id >= {id}', { id: 2 })
		expect(rowCount).toEqual(2)
	})

	// verify update
	test('verify update', async () => {
		const myNum = await db.query.field('SELECT f3 FROM vitest_query WHERE id = {id}', { id: 3 })
		expect(myNum).toEqual(69)
	})
})
