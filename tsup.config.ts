import { defineConfig } from 'tsup'


export default defineConfig({
	entry: ['src/index.ts'],
	outDir: 'dist',
	clean: true,
	minify: false,
	sourcemap: false,
	target: "es2020",
	format: ['esm', 'cjs'],
	dts: true,
})
