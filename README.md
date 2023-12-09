# flunsi/query


## Description
A simple wrapper around [pg.query()](https://github.com/brianc/node-postgres) for simple use cases.
If you don't like ORMs, but pg.query() is too painfull to work with, this package might be for you.


## Features
- Every use case has it's own methode and return type (see list below)
- Parameters as an object (not an array)
- String parameters are automatically escaped
- Optionally typed return values


## Methodes

| methode                  | returns  |
| :----------------------- | :------------------------------------ |
| `query.field()`          | string or number  |
| `query.row()`            | object (first row)  |
| `query.rowAsArray()`     | array (first row)  |
| `query.rows()`           | array of objects  |
| `query.columnAsArray()`  | array (first column)  |
| `query.update()`         | number (rowCount aka rowsAffected)  |


## Install
    npm install @flunsi/query


## Usage
```
import Pool from 'pg-pool'
import Query from '@flunsi/query'

const pool = new Pool({ connectionString: DB_URL })
const query = new Query(pool)

const userName = await query.field(
	'SELECT userName FROM users WHERE userId = {userId}',
	{ userId: 69 })
```

## Definition
All methodes have the same input parameters. Only the return type differs.
`field()` is used as an example:
`field(statement: string, params?: Record<string, string | number>) : Promise<string | number>`


## Examples
### Data
| id | name | age |
| -- | ---- | --- |
|  1 | Coco |   4 |
|  2 | Bibi |   3 |


### Code
#### query.field()
```
// Select a stingle string value (untyped and with no parameters)
const name = await query.field(
	'SELECT name FROM animals WHERE id = 1')
```
`name = 'Coco'`


```
// Select a single number value
const age = await query.field<number>(
	'SELECT age FROM animals WHERE id = {id}',
	{ id: 1 })
```
`age = 4`


#### query.row()
```
// Select a single row
type Animal = { name: string, age: number }
const animal = await query.row<Animal>(
	'SELECT name, age FROM animals WHERE id = {id}',
	{ id: 1 })
```
`animal = { name: 'Coco', age: 4 }`


#### query.rowAsArray()
```
// Select a single row
const animal = await query.rowAsArray(
	'SELECT name, age FROM animals WHERE id = {id}',
	{ id: 1 })
```
`animal = ['Coco', 4]`


#### query.rows()
```
// Select multiple rows
type Animals = Array<{ name: string, age: number }>
const animals = await query.rows<Animals>(
	'SELECT name, age FROM animals WHERE name in ({name1}, {name2})',
	{ name1: 'Coco', name2: 'Bibi' })
```
`animals = [ { name: 'Coco', age: 4 }, { name: 'Bibi', age: 3 } ]`


#### query.columnAsArray()
```
// Select a single column as an array
type Names = Array<string>
const names = await query.columnAsArray<Names>('SELECT name FROM animals')
```
`names = ['Coco', 'Bibi']`


#### query.update()
```
// Update with returning rowCount (aka: rowsAffected)
const rowCount = await query.update(
	'UPDATE animals SET age = age + 1 WHERE id BETWEEN {idLow} AND {idHigh}',
	{ idLow: 1, idHigh: 2 })
```
`rowCount = 2`


#### query.field()
```
// Insert with returning auto-incremented id
const newId = await query.field<number>(
	'INSERT INTO animals (name, age) VALUES ({name}, {age}) RETURNING id',
	{ name: 'Lulu', age: 1 })
```
`newId = 3`
