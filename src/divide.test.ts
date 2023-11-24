import { divide } from './divide'


describe('divide', () => {
	test.each([
		{ num1: 2, num2: 1, expected: 2 },
		{ num1: 6, num2: 2, expected: 3 },
	])('$num1  /  $num2  =  $expected', ({ num1, num2, expected }) => {
		expect(divide(num1, num2)).toEqual(expected)
	})

	test('singleTest', () => { expect(() => divide(1, 0)).toThrow() })
})
