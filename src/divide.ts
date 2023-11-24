export function divide(num1: number, num2: number) {
	if (num2 === 0)
		throw new Error('Cannot divide by zero')
	return num1 / num2
}
