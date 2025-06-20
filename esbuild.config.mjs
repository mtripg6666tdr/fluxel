#!/usr/bin/env node

import fs from 'fs';
import { performance } from 'perf_hooks';
import { build } from 'esbuild';
import packageJson from './package.json' with { type: 'json' };

const start = performance.now();

const banner = (moduleName) => ({
  js: `/**\n * ${[
    `${packageJson.name}${moduleName ? `-${moduleName}` : ''} v${packageJson.version}`,
    "",
    `Copyright (c) ${new Date().getFullYear()} ${packageJson.author}`,
    "",
    "This source code is licensed under the MIT license found in the",
    "LICENSE file in the root directory of this source tree.",
    "",
    `@see ${packageJson.homepage}`,
    `@license MIT`,
  ].join("\n * ")}\n*/`,
});

/** @satisfies {import('esbuild').BuildOptions} */
const commonBuildOptions = {
  format: 'iife',
  bundle: true,
  minify: true,
  target: ['chrome64', 'firefox78', 'safari11', 'edge79'],
  metafile: true,
  outdir: '.',
};

/** @satisfies {import('esbuild').BuildOptions[]} */
const buildConfigs = [
  {
    entryPoints: [{
        in: './dist/esm/index.js',
        out: './dist/browser/fluxel.min',
    }],
    inject: ['./tools/injects/fluxelBrowserInject.mjs'],
    globalName: '__Fluxel_esm',
    banner: banner(''),
  },
  {
    entryPoints: [{
        in: './dist/esm/reactive/index.js',
        out: './dist/browser/fluxel-reactive.min',
    }],
    inject: ['./tools/injects/fluxelBrowserInject.mjs'],
    globalName: '__Fluxel_esm',
    banner: banner('reactive'),
  },
  {
    entryPoints: [{
      in: './dist/esm/reactive-router/index.js',
      out: './dist/browser/fluxel-reactive-router.min',
    }],
    inject: ['./tools/injects/fluxelBrowserInject.mjs'],
    globalName: '__Fluxel_esm',
    banner: banner('reactive-router'),
  },
  {
    entryPoints: [{
      in: './dist/esm/h/index.js',
      out: './dist/browser/fluxel-h.min',
    }],
    inject: ['./tools/injects/hFactoryBrowserInject.mjs'],
    globalName: '__HFactory_esm',
    banner: banner('h-factory'),
  },
  {
    entryPoints: [{
      in: './dist/esm/ssr/client/index.js',
      out: './dist/browser/fluxel-ssr-client.min',
    }],
    inject: ['./tools/injects/ssrClientBrowserInject.mjs'],
    globalName: '__FluxelSSRClient_esm',
    banner: banner('ssr-client'),
  },

  // Bundles only for calculating size, not ready for production use
  {
    entryPoints: [{
        in: './dist/esm/jsx-runtime/index.js',
        out: './dist/browser/fluxel-jsx-runtime.min',
    }],
    globalName: 'FluxelJSXRuntime',
    banner: banner('jsx-runtime'),
  },
  {
    entryPoints: [{
      in: './dist/esm/jsx-reactive-router/entryForSizeCalc.js',
      out: './dist/browser/fluxel-jsx-reactive-router.min',
    }],
    globalName: 'FluxelJSXRouter',
    banner: banner('jsx-reactive-router'),
  },
]

const { input, output } = (await Promise.allSettled(
  buildConfigs.map(config => build(Object.assign(config, commonBuildOptions)))
)).reduce((acc, res, index) => {
  if (res.status === 'fulfilled') {
    acc.input += res.value.metafile.inputs ? Object.keys(res.value.metafile.inputs).length : 0;
    acc.output += res.value.metafile.outputs ? Object.keys(res.value.metafile.outputs).length : 0;
  }else{
    console.error(`Error during build #${index + 1}:`, res.reason);
  }
  return acc;
}, { input: 0, output: 0 });
const end = performance.now();

console.log(`Successfully compiled: ${input || "unknown"} files into ${output || "unknown"} bundles with esbuild (${
  Math.round(end - start)
}ms)`);

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
