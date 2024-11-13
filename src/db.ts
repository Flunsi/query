import PgPool from 'pg-pool'
import type { Pool, ClientConfig } from "pg"
import { Query } from "./query"
import { QueryTx } from "./queryTx"
// "pg": "^8.13.1",

// PoolOptions selber erstellt, weil importiertes Interface nicht funktioniert
interface PoolOptions extends ClientConfig {
	connectionTimeoutMillis: number,
	idleTimeoutMillis: number,
	max: number,
	allowExitOnIdle: boolean
}


export class Db {
	public query: Query

	constructor(config: PoolOptions) {
		this.pool = new PgPool(config)

		this.pool.on('error', function (error) {
			console.error('POOL_ON_ERROR:', error)
		})

		this.query = new Query(this.pool)
	}


	public async transaction<ReturnType>(fn: (queryTx: QueryTx) => Promise<ReturnType>, errorSource = ''): Promise<ReturnType | undefined> {
		const poolClient = await this.pool.connect()
		const queryTx = new QueryTx(poolClient)
		try {
			await queryTx.begin()
			const result = await fn(queryTx)
			await queryTx.commit()
			return result
		} catch (error) {
			if (errorSource)
				console.error("ErrorSource:", errorSource)
			console.error("Error:", error)
			await queryTx.rollback()
			return undefined
		} finally {
			poolClient.release()
		}
	}


	/*****************************************************************************************************/
	//   private
	/*****************************************************************************************************/
	private pool: Pool
}
