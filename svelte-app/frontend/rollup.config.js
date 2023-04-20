import { spawn } from 'child_process';
import copy from 'rollup-plugin-copy';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
        file: '../myapp/static/frontend/bundle.js' // <-- here
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		copy({
			targets: [
			  { src: 'public/global.css', dest: '../myapp/static/frontend' },
			  { src: 'public/favicon.png', dest: '../myapp/static/frontend' },
			],
		  }),
		  
		// we'll extract any component CSS out into
		// a separate file - better for performance
		// css({ output: '../myapp/static/frontend/bundle.css' }),
		postcss({
			extract: '../myapp/static/frontend/bundle.css',
			minimize: production,
		  }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
        !production && livereload('../myapp/static/frontend'), // <-- here

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
