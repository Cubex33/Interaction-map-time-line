import {build} from 'esbuild';
import {writeFileSync,readFileSync,mkdirSync,rmSync} from 'node:fs';
mkdirSync('.standalone',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,format:'iife',outfile:'.standalone/app.js',define:{'process.env.NODE_ENV':'"production"'},loader:{'.png':'dataurl','.svg':'dataurl'}});
const js=readFileSync('.standalone/app.js','utf8').replaceAll('</script','<\\/script');
const css=readFileSync('.standalone/app.css','utf8').replaceAll('</style','<\\/style');
writeFileSync('START.html',`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Семей · Живая история</title><style>${css}</style><body><div id="root"></div><script>${js}</script></body></html>`);
rmSync('.standalone',{recursive:true});
