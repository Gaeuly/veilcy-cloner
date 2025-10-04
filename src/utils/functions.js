const https = require('https');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = buffer.toString('base64');
                const mimeType = res.headers['content-type'] || 'image/png';
                resolve(`data:${mimeType};base64,${base64}`);
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

module.exports = { delay, downloadImage };