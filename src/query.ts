import type { Pool, QueryResultRow } from "pg"
import { replacePlaceholderSql } from "./utility"
import type { StringOrNumber, StringOrNumberObject } from './types'


export class Query {
	private pool: Pool


	constructor(pool: Pool) {
		this.pool = pool
	}


	/**
	 * @example query('SELECT * FROM sessions WHERE client_id = {clientId}', { clientId: 11 })
	 */
	public async raw(statement: string, params?: StringOrNumberObject) {
		const statementReplaced = replacePlaceholderSql(statement, params)
		const result = await this.pool.query(statementReplaced)
		return result
	}


	public async rows<Type extends Array<QueryResultRow>>(statement: string, params?: StringOrNumberObject) {
		const result = await this.raw(statement, params)
		return result.rows as Type
	}


	public async row<Type extends QueryResultRow>(statement: string, params?: StringOrNumberObject) {
		const result = await this.raw(statement, params)
		const rows = result.rows

		if (rows.length <= 0)
			return undefined

		return rows[0] as Type
	}


	public async field<Type extends StringOrNumber>(statement: string, params?: StringOrNumberObject) {
		const result = await this.raw(statement, params)
		const rows = result.rows

		if (rows.length <= 0)
			return undefined

		const firstRow = rows[0]
		const firstColumn = Object.keys(firstRow)[0]
		return firstRow[firstColumn] as Type
	}


	public async columnAsArray<Type extends Array<StringOrNumber>>(statement: string, params?: StringOrNumberObject) {
		const result = await this.raw(statement, params)
		const rows = result.rows

		if (rows.length <= 0)
			return []

		const firstRow = rows[0]
		const firstColumn = Object.keys(firstRow)[0]

		const resultAry = rows.map(row => row[firstColumn])

		return resultAry as Type
	}


	public async update(statement: string, params?: StringOrNumberObject) {
		const result = await this.raw(statement, params)
		return result.rowCount
	}
}
