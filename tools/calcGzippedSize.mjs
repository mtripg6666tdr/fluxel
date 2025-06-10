import fs from "fs/promises";
import { gzip as _gzip } from "zlib";
import { promisify, styleText } from "util";
const gzip = promisify(_gzip);

const outJson = process.argv.includes("--json");

const outMarkdown = process.argv.includes("--update-readme");

let markdown = outMarkdown ? await fs.readFile("./README.md", "utf-8") : null;

const files = await fs.readdir("./dist/browser");

if(outJson){
  console.log("[");
}

await Promise.all(
  files.map(async file => {
    if (file.endsWith(".min.js")) {
      const filePath = `./dist/browser/${file}`;
      const data = await fs.readFile(filePath);
      const gzippedData = await gzip(data, { level: 9 });

      if(outMarkdown){
        const id = {
          "fluxel.min.js": "CORE",
          "fluxel-reactive.min.js": "RCORE",
          "fluxel-jsx-runtime.min.js": "JSX",
          "fluxel-reactive-router.min.js": "ROUTER",
          "fluxel-jsx-reactive-router.min.js": "JROUTER",
        }[file];
        if(id){
          markdown = markdown.replace(
            new RegExp(`<!--${id}-->\\d\\.\\d+KB<!--${id}-->`),
            `<!--${id}-->${(gzippedData.byteLength / 1024).toFixed(1)}KB<!--${id}-->`
          )
        }
      }

      if(outJson){
        console.log(`  { "file": "${file}", "size": ${gzippedData.byteLength} }${file === files[files.length - 1] ? "" : ","}`);
      }else{
        console.log(`Calculated gzipped file: ${file} (${styleText("yellow", `${(gzippedData.byteLength / 1024).toFixed(2)} KB`)})`);
      }
    }
  })
);

if(outJson){
  console.log("]");
}

if(outMarkdown){
  await fs.writeFile("./README.md", markdown);
  console.log("Updated README.md with gzipped sizes.");
}
