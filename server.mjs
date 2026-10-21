import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const file = fileURLToPath(new URL('./START.html', import.meta.url));
const server = http.createServer(async (req, res) => { try { if (req.url !== '/' && req.url !== '/START.html') { res.writeHead(404); res.end(); return } res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(await readFile(file)) } catch { res.writeHead(500); res.end('START.html not found') } });
server.listen(4174, '127.0.0.1', () => { console.log('Open http://127.0.0.1:4174 — Ctrl+C to stop'); if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '', 'http://127.0.0.1:4174']) });
server.on('error', e => { console.error(e.message); process.exitCode = 1 });
