import commonjs from "@rollup/plugin-commonjs";
import json from '@rollup/plugin-json';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { defineConfig } from "rollup";

export default defineConfig({
  input: ["dist/main.js"],
  output: [
    {
      format: "es",
      name: 'server.js',
      file: 'dist/server.js'
    },
  ],
  external: ['sqlite3', 'better-sqlite3'],
  plugins: [
    json(),
    nodeResolve({
      exportConditions: ["node"],

    }),
    commonjs(),
    // terser({
    //   compress: true,
    //   mangle: true,

    // }),
    {
      name: 'replace-static-files',

      transform(code, id) {
        if (/\/\*STATIC_FILES\*\//.test(code)) {
          const staticFiles = {};
          function readAllFiles(dirPath) {
            readdirSync(dirPath).forEach((file) => {
              const fullPath = join(dirPath, file);
              const fileStats = statSync(fullPath);
              if (fileStats.isDirectory()) {
                readAllFiles(fullPath);
              } else {
                staticFiles["/" + relative("./www", fullPath)] = [
                  ...readFileSync(fullPath, {}),
                ];
              }
            });
          }
          readAllFiles('./www')
          const str = JSON.stringify(staticFiles)
          const ret = code
            .replace(/\/\*STATIC_FILES\*\//g, str.slice(1, str.length - 1))
            .replace(`readAllFiles("./www")`, '')
          return ret;
        }
        return null;
      }
    }
  ],
});
