const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    
    // Normalize URL path to prevent directory traversal
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    // Check if the requested file is within the current directory
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`[404] File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Not Found');
            } else {
                console.error(`[500] Read error: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Internal Server Error: ${err.code}`);
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 
            'Content-Type': mime,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        });
        res.end(content, 'utf-8');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});
