import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs'
import scss from 'rollup-plugin-scss'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

// import { terser } from "rollup-plugin-terser";

const extensions = [
    '.js', '.jsx', '.ts', '.tsx', '.scss',
];

export default {
    input: './src/Main.ts',

    // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
    // external: [],

    plugins: [
        scss({
            output: 'dist/styles.css',
        }),

        // Allows node_modules resolution
        resolve({
            extensions,
            preferBuiltins: false,
        }),

        // Allow bundling cjs modules. Rollup doesn't understand cjs
        commonjs(),

        // Compile TypeScript/JavaScript files
        babel({
            extensions,
            babelHelpers: 'bundled',
            include: ['src/**/*'],
        }),

        serve({
            port: 8080,
            onListening: function (server) {
                console.log("server listening on 8080");
            }
        }),
        
        livereload({
            watch: 'dist'
        }),

        //terser()
    ],

    output: [
        {
            file: "dist/grpexplorer.js",
            format: 'umd',
            name: "grpexplorer",
            sourcemap: true
        }
    ],

};
