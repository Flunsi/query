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
	await db.query.update(`DROP TABLE IF EXISTS "vitest_transaction"`)
	await db.query.update(
		`CREATE TABLE "vitest_transaction" (
		"id" SERIAL PRIMARY KEY,
		"f1" int2 NOT NULL DEFAULT 0)`)
})


afterAll(async () => {
	await db.query.update(`DROP TABLE IF EXISTS "vitest_transaction"`)
})


describe('transaction', async () => {
	const statement = 'INSERT INTO vitest_transaction (f1) VALUES ({f1}) returning id'

	test('Commit + Auto-Increment + returning id', async () => {
		const maxId = await db.transaction(async (queryTx) => {
			await queryTx.field(statement, { f1: 111 })
			await queryTx.field(statement, { f1: 222 })
			return await queryTx.field(statement, { f1: 333 })
		})
		expect(maxId).toEqual(3)
	})

	test('Rollback + ReturnValue on Error is undefined', async () => {
		const returnValue = await db.transaction(async (queryTx) => {
			await queryTx.field(statement, { f1: 444 })
			await queryTx.field(statement, { f1: 'Ich bin ein Fehler' })
			return 123
		})
		expect(returnValue).toEqual(undefined)
	})

	test('Rollback', async () => {
		await db.query.field("TRUNCATE TABLE vitest_transaction")
		await db.query.field(statement, { f1: 11 })
		await db.query.field(statement, { f1: 22 })

		await db.transaction(async (queryTx) => {
			// Rollback
			await queryTx.field(statement, { f1: 33 })
			await queryTx.field(statement, { f1: 'Ich bin ein Fehler' })
		})

		const countAsNumberOrString = await db.query.field("SELECT count(*) FROM vitest_transaction")
		const count = countAsNumberOrString?.toString()
		expect(count).toEqual("2")
	})
})
