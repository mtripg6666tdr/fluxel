import fs from "fs/promises";
import { gzip as _gzip } from "zlib";
import { promisify, styleText } from "util";
const gzip = promisify(_gzip);

const outJson = process.argv.includes("--json");

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
