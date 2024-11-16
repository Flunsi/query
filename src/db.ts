// import PgPool from 'pg-pool'
// import { setTypeParser } from 'pg-types'

import { Pool, types } from "pg"
import type { ClientConfig } from "pg"

import { Query } from "./query"
import { QueryTx } from "./queryTx"


// PoolOptions selber erstellt, weil importiertes Interface nicht funktioniert
export interface PoolOptions extends ClientConfig {
	connectionTimeoutMillis?: number,
	idleTimeoutMillis?: number,
	max?: number,
	allowExitOnIdle?: boolean
}

export type BigintParser = 'STRING' | 'NUMBER_OR_ERROR' | 'NUMBER_OR_STRING'


export class Db {
	public query: Query

	constructor(config: PoolOptions, bigintParser: BigintParser = 'NUMBER_OR_ERROR') {
		this.setBigintParser(bigintParser)

		this.pool = new Pool(config)

		this.pool.on('error', function (error) {
			console.error('POOL_ON_ERROR:', error)
		})

		this.query = new Query(this.pool)
	}


	// Needs to be called like this: db.transaction(...)
	// Do NOT destructure the object like this: const { transaction } = db !!!
	public async transaction<ReturnType>(fn: (queryTx: QueryTx) => Promise<ReturnType>, errorSource = ''): Promise<ReturnType | undefined> {
		const poolClient = await this.pool.connect()
		const queryTx = new QueryTx(poolClient)
		try {
			await queryTx.begin()
			const result = await fn(queryTx)
			await queryTx.commit()
			return result
		} catch (error) {
			console.error("ERROR => DB-Transaction-Rollback.")
			if (errorSource)
				console.error("ErrorSource:", errorSource)
			console.error("Error:", error)
			await queryTx.rollback()
			return undefined
		} finally {
			poolClient.release()
		}
	}


	public async end() {
		await this.pool.end()
	}


	/*****************************************************************************************************/
	//   private
	/*****************************************************************************************************/
	private pool: Pool


	private setBigintParser(bigintParser: BigintParser) {
		if (bigintParser === 'STRING') {
			types.setTypeParser(20, function (val: string) {
				return val
			})
		}
		else if (bigintParser === 'NUMBER_OR_ERROR') {
			types.setTypeParser(20, function (val: string) {
				if (val.length <= 15)
					return parseInt(val)
				throw new Error("NUMBER_OR_ERROR: Bigint out of range.")

			})
		}
		else if (bigintParser === 'NUMBER_OR_STRING') {
			types.setTypeParser(20, function (val: string) {
				if (val.length <= 15)
					return parseInt(val)
				return val
			})
		}
	}
}
