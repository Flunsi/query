import { Db } from '../src/db'
import 'dotenv/config'


// ACHTUNG, ALLE Tests laufen parallel, trotz maxConcurrency = 1
// Deshalb braucht jedes Test-File eine eigene Tabelle
beforeAll(async () => {
	const db = new Db({ connectionString: process.env.DB_URL })
	await db.query.update(`DROP TABLE IF EXISTS "vitest_bigint"`)
	await db.query.update(
		`CREATE TABLE "vitest_bigint" (
		"bigint1" int8 NOT NULL DEFAULT 0,
		"bigint2" int8 NOT NULL DEFAULT 0)`)
	await db.query.update(`INSERT INTO "vitest_bigint" (bigint1, bigint2) VALUES (123456789012345, 1234567890123456)`)
	await db.end()
})


afterAll(async () => {
	const db = new Db({ connectionString: process.env.DB_URL })
	await db.query.update(`DROP TABLE IF EXISTS "vitest_bigint"`)
	await db.end()
})


const bigint1number = 123456789012345
const bigint1string = "123456789012345"
const bigint2string = "1234567890123456"

const selectBigint1 = 'SELECT bigint1 FROM vitest_bigint'
const selectBigint2 = 'SELECT bigint2 FROM vitest_bigint'

describe("BigintParser = 'STRING'", async () => {
	test("bigint small enough", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'STRING')
		const ret = await db.query.field(selectBigint1)
		expect(ret).toEqual(bigint1string)
		await db.end()
	})

	test("bigint too big", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'STRING')
		const ret = await db.query.field(selectBigint2)
		expect(ret).toEqual(bigint2string)
		await db.end()
	})
})


describe("BigintParser = 'NUMBER_OR_ERROR'", async () => {
	test("bigint small enough", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'NUMBER_OR_ERROR')
		const ret = await db.query.field(selectBigint1)
		expect(ret).toEqual(bigint1number)
		await db.end()
	})

	test("bigint too big", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'NUMBER_OR_ERROR')
		await expect(async () => { await db.query.field(selectBigint2) }).rejects.toThrow()
		await db.end()
	})
})


describe("BigintParser = 'NUMBER_OR_STRING'", async () => {
	test("bigint small enough", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'NUMBER_OR_STRING')
		const ret = await db.query.field(selectBigint1)
		expect(ret).toEqual(bigint1number)
		await db.end()
	})

	test("bigint too big", async () => {
		const db = new Db({ connectionString: process.env.DB_URL }, 'NUMBER_OR_STRING')
		const ret = await db.query.field(selectBigint2)
		expect(ret).toEqual(bigint2string)
		await db.end()
	})
})
