// Server statico per l'anteprima locale del sito.
// Avvio:  node scripts/dev-server.js   ->   http://localhost:4321
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.webmanifest': 'application/manifest+json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function send(res, code, body, type) {
    res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body);
}

http.createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        return send(res, 400, 'Richiesta non valida');
    }

    // Il file richiesto deve restare dentro la cartella del sito.
    let file = path.resolve(ROOT, '.' + urlPath);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'Accesso negato');

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');

    if (!fs.existsSync(file)) {
        const notFound = path.join(ROOT, '404.html');
        if (fs.existsSync(notFound)) {
            return send(res, 404, fs.readFileSync(notFound), TYPES['.html']);
        }
        return send(res, 404, 'Pagina non trovata: ' + urlPath);
    }

    send(res, 200, fs.readFileSync(file), TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
}).listen(PORT, () => {
    console.log('Sito GIAL disponibile su http://localhost:' + PORT + '/');
    console.log('Pronto intervento: http://localhost:' + PORT + '/pronto-intervento-idraulico-prato/');
});
