#! /usr/bin/env node

// @ts-check
const fs = require("fs");
const path = require("path");
const typescript = require("typescript");

const file = typescript.createSourceFile("code.ts", "export type A = keyof HTMLElementTagNameMap;", typescript.ScriptTarget.ESNext, true);
/** @type {import("typescript").CompilerOptions} */
const options = typescript.convertCompilerOptionsFromJson({
  lib: ["DOM", "ESNext"],
  target: typescript.ScriptTarget.ESNext,
  module: typescript.ModuleKind.ESNext,
}, ".").options;
const host = typescript.createCompilerHost(options);
const originalGetSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (filename, ...args) => filename === "code.ts" ? file : originalGetSourceFile(filename, ...args);

const program = typescript.createProgram(["code.ts"], options, host);
const checker = program.getTypeChecker();
const node = file.statements[0];

if(!typescript.isTypeAliasDeclaration(node)) {
  throw new Error("Node is not a type alias declaration");
}

const type = checker.getTypeFromTypeNode(node.type);

if(!type.isUnion()) {
  throw new Error("Type is not a union type");
}

const output = `
// This file is auto-generated. Do not edit manually.

const tags = [
  ${
  type.types
    .map(t => checker.typeToString(t))
    .join(",\n  ")
},
] as const;

export default tags;
`.trimStart();

fs.writeFileSync(path.join(__dirname, "src", "tags__generated.ts"), output, "utf-8");
