import { readdir, writeFile } from "node:fs/promises";
import path, { resolve as pathResolve } from "path";
import { Plugin, ResolvedConfig } from "vite";

export function svgDts(): Plugin {
  let config: ResolvedConfig;
  async function generateByPath(item: string) {
    const file = path.basename(item).replace(".svg", "");
    await writeFile(
      item + ".d.ts",
      `const ${file}Icon: (props: React.JSX.IntrinsicElements['svg']) => JSX.Element;
export default ${file}Icon;`
    );
  }

  return {
    name: "svg-dts",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const list = (
        await readdir(pathResolve(config.root, "./src/components/icons"))
      ).filter((f) => f.endsWith(".svg"));
      await Promise.all(
        list.map(async (item) => {
          const cssPath = path.resolve(
            config.root,
            "./src/components/icons",
            item
          );
          await generateByPath(cssPath);
        })
      );
    },
  };
}
