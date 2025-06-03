import { build } from 'esbuild';

await build({
  entryPoints: [
    {
      in: './dist/esm/index.js',
      out: './dist/browser/index',
    },
    {
      in: './dist/esm/reactive/index.js',
      out: './dist/browser/reactive/index',
    },
  ],
  bundle: true,
  minify: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outdir: '.',
  globalName: 'Fluxel',
})
