import { defineConfig } from 'vitest/config'


// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
	test: {
		include: [
			'src/**/*.{test,spec}.{js,ts}',
			'tests/**/*.{test,spec}.{js,ts}',
		],
		globals: true,
	},
})
