import type { Pool, QueryResultRow } from "pg"
import { replacePlaceholderSql } from "./utility"
import type { StringOrNumber, StringOrNumberObject } from './types'


export class Query {
	private pool: Pool


	constructor(pool: Pool) {
		this.pool = pool
	}


	public async rows<Type extends Array<QueryResultRow>>(statement: string, params?: StringOrNumberObject) {
		const result = await this._raw(statement, params)
		return result.rows as Type
	}


	public async row<Type extends QueryResultRow>(statement: string, params?: StringOrNumberObject, raiseErrorOnMultipleRows = false) {
		const result = await this._raw(statement, params)
		const rows = result.rows

		if (rows.length <= 0)
			return undefined

		if (rows.length > 1 && raiseErrorOnMultipleRows)
			throw new Error(`Expected 1 row, got ${rows.length}`)

		return rows[0] as Type
	}


	public async rowAsArray<Type extends Array<StringOrNumber>>(statement: string, params?: StringOrNumberObject, raiseErrorOnMultipleRows = false) {
		const firstRow = await this.row(statement, params, raiseErrorOnMultipleRows)
		if (!firstRow)
			return undefined

		return Object.values(firstRow) as Type
	}


	public async field<Type extends StringOrNumber>(statement: string, params?: StringOrNumberObject) {
		const firstRow = await this.row(statement, params)
		if (!firstRow)
			return undefined

		const firstColumn = Object.keys(firstRow)[0]
		return firstRow[firstColumn] as Type
	}


	public async columnAsArray<Type extends Array<StringOrNumber>>(statement: string, params?: StringOrNumberObject) {
		const result = await this._raw(statement, params)
		const rows = result.rows

		if (rows.length <= 0)
			return []

		const firstRow = rows[0]
		const firstColumn = Object.keys(firstRow)[0]

		const resultAry = rows.map(row => row[firstColumn])

		return resultAry as Type
	}


	public async update(statement: string, params?: StringOrNumberObject) {
		const result = await this._raw(statement, params)
		return result.rowCount
	}


	private async _raw(statement: string, params?: StringOrNumberObject) {
		const statementReplaced = replacePlaceholderSql(statement, params)
		const result = await this.pool.query(statementReplaced).catch(error => {
			console.log(statement)
			console.log(params)
			console.log(error.message)
			throw new Error(error.message)
		})
		return result
	}
}
