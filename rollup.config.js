import { spawn } from "child_process";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import fs from 'fs-extra';

const copyFilePlugin = (sourceDir, targetDir) => {
	return {
		name: 'copy-file',
		buildStart() {
			fs.copy(sourceDir, targetDir, { overwrite: true }, err => {
				if (err) return console.error(err);
				console.log(`${sourceDir} copied successfully!`);
			});
		}
	};
};

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true,
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		},
	};
}

export default [
	{
		input: "src/background/background.ts",
		output: {
			sourcemap: false,
			format: "iife",
			name: "app",
			file: "public/build/background.js",
		},
	},
	{
		input: 'src/pass-cybozu-data.js',
		output: {
			file: 'public/pass-cybozu-data.js',
			format: 'iife'
		},
		plugins: [
			typescript({ sourceMap: false }),
			resolve(),
			commonjs(),
			production && terser(),
		],
		watch: {
			clearScreen: false,
		},
	},
	{
		input: "src/main.ts",
		output: {
			sourcemap: false,
			format: "iife",
			name: "app",
			file: "public/build/bundle.js",
		},
		plugins: [
			svelte({
				preprocess: sveltePreprocess({ sourceMap: false }),
				compilerOptions: {
					// enable run-time checks when not in production
					dev: !production,
				},
			}),
			postcss({
				extract: true,
				minimize: true,
				use: [
					[
						"sass",
						{
							includePaths: ["./src/theme", "./node_modules"],
						},
					],
				],
			}),
			css({ output: "bundle.css" }),
			resolve({
				browser: true,
				dedupe: ["svelte"],
				exportConditions: ["svelte"],
			}),
			typescript({
				sourceMap: false,
				inlineSources: !production,
			}),
			commonjs(),
			!production && serve(),
			!production && livereload("public"),
			production && terser(),
			copyFilePlugin('src/manifest.json', 'public/manifest.json'),
			copyFilePlugin('src/icons', 'public/icons'),
			copyFilePlugin('src/_locales', 'public/_locales'),
			copyFilePlugin('src/index.html', 'public/index.html')
		],
		watch: {
			clearScreen: false,
		},
	},
	{
		input: "src/notificationHandler/content.js",
		output: {
			sourcemap: false,
			format: "iife",
			name: "content",
			file: "public/build/content.js",
		},
		plugins: [
			resolve({
				browser: true,
			}),
			commonjs(),
			production && terser(),
		],
		watch: {
			clearScreen: false,
		},
	},
];