import { defineConfig } from 'tsup'


export default defineConfig({
	entry: ['./src/index.ts'],
	outDir: './dist',
	clean: true,
	minify: false,
	sourcemap: true,
	target: "es2020",
	format: ['esm'],
	dts: true,
})
