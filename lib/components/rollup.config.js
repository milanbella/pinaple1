import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import styles from "rollup-plugin-styles";

const packageJson = require("./package.json");

export default {
  input: "components/index.ts",
  output: [
    {
      file: 'dist/index.js',
      format: "cjs",
      sourcemap: true,
      assetFileNames: "[name][extname]"
    },
    {
      file: 'dist/index.es.js',
      format: "esm",
      sourcemap: true,
      assetFileNames: "[name][extname]"
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ 
      useTsconfigDeclarationDir: true,
      tsconfig: 'tsconfig-lib.json'
    }),
    styles({
      mode: ['extract', 'main.css']
    })
  ]
};
