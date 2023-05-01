import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
/*
 * In the future, babel will be removed
 * import babel from '@rollup/plugin-babel';
 */
import pkg from './package.json';

const name = 'tfontfaceobserver';
const extensions = ['.js', '.ts'];
const outputFormats = [
	{
		file: pkg.main,
		format: 'cjs'
	},
	{
		file: pkg.module,
		format: 'es'
	},
	{
		file: pkg.browser,
		format: 'umd',
		name,
		globals: {}
	}
];

const packageConfigs = outputFormats.map((f) => {
	const packageConfig = {
		input: path.resolve(__dirname, './src/index.ts'),
		plugins: [
			resolve({ extensions }),
			commonjs(),
			typescript({
				tsconfig: path.resolve(__dirname, 'tsconfig.json'),
				sourceMap: false
			})
		],
		output: f
	};
	if (f.format === 'umd') {
		packageConfig.compact = true;
	}
	return packageConfig;
});

export default packageConfigs;
