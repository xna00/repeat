import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from '@rollup/plugin-json'
import terser from "@rollup/plugin-terser";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

export default defineConfig({
  input: ["dist/main.js"],
  output: [
    {
      format: "cjs",
      name: 'server.js',
      file: 'dist/server.js'
    },
  ],
  external: ['sqlite3'],
  plugins: [
    json(),
    nodeResolve({
      exportConditions: ["node"],
    }),
    commonjs(),
    terser({
      mangle: false
    }),
    {
      name: 'replace-static-files',

      transform(code, id) {
        // 检查是否包含特定的标记
        if (/\/\*STATIC_FILES\*\//.test(code)) {
          const staticFiles = {
            /*STATIC_FILES*/
          };
          function readAllFiles(dirPath) {
            // 读取目录中的内容
            readdirSync(dirPath).forEach((file) => {
              const fullPath = join(dirPath, file);
              const fileStats = statSync(fullPath);
              if (fileStats.isDirectory()) {
                // 如果是目录，递归调用 readAllFiles
                readAllFiles(fullPath);
              } else {
                // 如果是文件，将文件路径和状态添加到 map 中
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
          // 替换为 {}
          return ret;
          // console.log(id, ret)
        }
        return null; // 如果没有找到标记，返回 null 表示不修改原始代码
      }
    }
  ],
});
