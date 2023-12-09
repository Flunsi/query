import { QueryTx } from './queryTx'
import 'dotenv/config'
import pg from 'pg'
const { Pool } = pg


const pool = new Pool({ connectionString: process.env.DB_URL })
let poolClient: pg.PoolClient
let queryTx: QueryTx


// ACHTUNG, ALLE Tests laufen parallel, trotz maxConcurrency = 1
// Deshalb braucht jedes Test-File eine eigene Tabelle
beforeAll(async () => {
	poolClient = await pool.connect()
	queryTx = new QueryTx(poolClient)

	await queryTx.update(`DROP TABLE IF EXISTS "vitest_query_tx"`)
	await queryTx.update(
		`CREATE TABLE "vitest_query_tx" (
		"id" SERIAL PRIMARY KEY,
		"f1" int2 NOT NULL DEFAULT 0,
		"f2" int2 NOT NULL DEFAULT 0,
		"f3" int2 NOT NULL DEFAULT 0)`)
})


afterAll(async () => {
	await queryTx.update(`DROP TABLE IF EXISTS "vitest_query_tx"`)

	poolClient.release()
})


beforeEach(async () => {
	await queryTx.update(`TRUNCATE TABLE "vitest_query_tx"`)
})


//  id   f1   f2   f3
//  =================
//   1  111  222  333
//   2  444  555  666
//   3  777  888  999

// { f1: 111, f2: 222, f3: 333 }
// { f1: 444, f2: 555, f3: 666 }
// { f1: 777, f2: 888, f3: 999 }


describe('QueryTx', async () => {
	const statementInsert = 'INSERT INTO vitest_query_tx (f1, f2, f3) VALUES ({f1}, {f2}, {f3})'


	test('commit', async () => {
		queryTx.begin()
		queryTx.update(statementInsert, { f1: 111, f2: 222, f3: 333 })
		queryTx.update(statementInsert, { f1: 444, f2: 555, f3: 666 })
		queryTx.commit()

		const f1 = await queryTx.columnAsArray('SELECT f1 FROM vitest_query_tx')
		expect(f1).toEqual([111, 444])
	})


	test('rollback', async () => {
		queryTx.update(statementInsert, { f1: 111, f2: 222, f3: 333 })
		queryTx.begin()
		queryTx.update(statementInsert, { f1: 444, f2: 555, f3: 666 })
		queryTx.rollback()

		const f1 = await queryTx.columnAsArray('SELECT f1 FROM vitest_query_tx')
		expect(f1).toEqual([111])
	})
})
