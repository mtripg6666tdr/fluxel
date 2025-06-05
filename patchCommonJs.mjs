import fs from "fs";

if(!fs.existsSync("./dist/cjs")){
  throw new Error("dist/cjs directory does not exist. Please check your build process.");
}

await fs.promises.writeFile("./dist/cjs/package.json", JSON.stringify({
  type: "commonjs",
}, null, 2) + "\n", "utf8");
