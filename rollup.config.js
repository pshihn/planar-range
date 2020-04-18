import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: 'lib/planar-range.js',
    output: {
      file: 'lib/planar-range.min.js',
      format: 'esm'
    },
    plugins: [resolve(), terser()]
  }
];