import type { PoolClient } from "pg"
import { Query } from "./query"


/*****************************************************************************************************/
//   query, but with transaction support
//   Needs poolClient, not pool!
/*****************************************************************************************************/
export class QueryTx extends Query {
	constructor(poolClient: PoolClient) {
		super(poolClient)
	}


	public async begin() {
		await this.connection.query("BEGIN")
	}


	public async commit() {
		await this.connection.query("COMMIT")
	}


	public async rollback() {
		await this.connection.query("ROLLBACK")
	}
}
