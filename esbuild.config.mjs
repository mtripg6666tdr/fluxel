#!/usr/bin/env node

import fs from 'fs';
import { performance } from 'perf_hooks';
import { build } from 'esbuild';
import packageJson from './package.json' with { type: 'json' };

const start = performance.now();
const result = await build({
  entryPoints: [
    {
      in: './dist/esm/index.js',
      out: './dist/browser/fluxel.min',
    },
    {
      in: './dist/esm/reactive/index.js',
      out: './dist/browser/fluxel-reactive.min',
    },
  ],
  format: 'iife',
  bundle: true,
  minify: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outdir: '.',
  inject: ['./browserInject.mjs'],
  globalName: '__Fluxel_esm',
  metafile: true,
  banner: {
    js: `/**\n * ${[
      `${packageJson.name} v${packageJson.version}`,
      "",
      `Copyright (c) ${new Date().getFullYear()} ${packageJson.author}`,
      "",
      "This source code is licensed under the MIT license found in the",
      "LICENSE file in the root directory of this source tree.",
      "",
      `@see ${packageJson.homepage}`,
      `@license MIT`,
    ].join("\n * ")}\n*/`,
  }
});
const end = performance.now();

console.log(`Successfully compiled: ${
  Object.keys(result.metafile?.inputs || {}).length || "unknown"
} files into ${
  Object.keys(result.metafile?.outputs || {}).length || "unknown"
} bundles with esbuild (${Math.round(end - start)}ms)`);

async function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    await fs.promises.mkdir(dest, { recursive: true });
  }
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

await copyDir('./dist/browser', './examples/dist');
