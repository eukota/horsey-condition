const http = require('http');
const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, 'scores.json');
const HTML_FILE = path.join(__dirname, 'index.html');
const LEVELS_FILE = path.join(__dirname, 'levels.js');

function readScores() {
  try { return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8')); }
  catch { return { highScores: [], fastTimes: [] }; }
}

function writeScores(data) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
}

http.createServer((req, res) => {
  const [urlPath, queryStr] = req.url.split('?');

  if (req.method === 'GET' && urlPath === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(HTML_FILE));

  } else if (req.method === 'GET' && urlPath === '/levels.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(fs.readFileSync(LEVELS_FILE));

  } else if (req.method === 'GET' && (urlPath === '/scores' || urlPath === '/scores.php')) {
    const params = new URLSearchParams(queryStr);
    const key = params.get('key') || 'default';
    const data = readScores();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data[key] || { highScores: [], fastTimes: [] }));

  } else if (req.method === 'POST' && (urlPath === '/scores' || urlPath === '/scores.php')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name, score, time, finished = true, settingsKey = 'default', encoding } = JSON.parse(body);
        if (!name || typeof score !== 'number' || typeof time !== 'number') {
          res.writeHead(400); res.end('Bad Request'); return;
        }
        const data = readScores();
        if (!data[settingsKey]) data[settingsKey] = { highScores: [], fastTimes: [] };

        const cat = data[settingsKey];
        const entry = { name, score, time, finished };
        if (encoding) entry.encoding = encoding;
        cat.highScores.push(entry);
        cat.highScores.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.time - b.time; // Faster time wins tie
        });
        cat.highScores = cat.highScores.slice(0, 10);

        cat.fastTimes.push(entry);
        cat.fastTimes.sort((a, b) => {
          if (a.finished !== b.finished) return a.finished ? -1 : 1;
          if (a.time !== b.time) return a.time - b.time;
          return b.score - a.score; // Higher score wins tie
        });
        cat.fastTimes = cat.fastTimes.slice(0, 10);

        writeScores(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cat));
      } catch {
        res.writeHead(400); res.end('Bad Request');
      }
    });
  } else {
    res.writeHead(404); res.end('Not Found');
  }
}).listen(2000, () => console.log('http://localhost:2000'));
