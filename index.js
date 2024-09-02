require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory database for URLs
let urlDatabase = [];
let idCounter = 1;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to create a shortened URL
app.get('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate the URL
  let url;
  try {
    url = new URL(originalUrl);
  } catch (_) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(url.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Store the URL and generate a short URL
    const shortUrl = idCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// API endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
