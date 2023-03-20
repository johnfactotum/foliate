import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

export default [{
    input: 'src/rollup/fflate.js',
    output: {
        dir: 'src/foliate-js/vendor/',
        format: 'esm',
    },
    plugins: [nodeResolve(), terser()],
},
{
    input: 'src/rollup/zip.js',
    output: {
        dir: 'src/foliate-js/vendor/',
        format: 'esm',
    },
    plugins: [nodeResolve(), terser()],
}]
