const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const port = 3001;
const IMAGE_FOLDER = path.join(__dirname, 'img');

app.set('trust proxy', 1);

// setup secure header
app.use(helmet());

// request limit: 5m / total: 50
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: 'Too Many Request!',
});
app.use(limiter);

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// generate folder
// if (!fs.existsSync(IMAGE_FOLDER)) {
//   fs.mkdirSync(IMAGE_FOLDER);
// }

app.get('/', (req, res) => {
  const requestName = req.query.name;

  // verify args
  if (!requestName || requestName.length > 255) {
    return res.status(400).send('Bad Request');
  }

  // parse
  const parsedName = requestName.replace(/[^a-zA-Z0-9-_]/g, '');
  if (parsedName !== requestName) {
    return res.status(400).send('Wrong Format');
  }

  fs.readdir(IMAGE_FOLDER, (err, files) => {
    if (err) {
      console.error('SERVER ERROR:', err);
      return res.status(500).send('Internal Server Error');
    }

    const matchedFile = files.find(file => {
      const parsed = path.parse(file);
      const name = parsed.name;
      const ext = parsed.ext.toLowerCase();

      // matched file is equal && is allowed img extension
      return name === parsedName && ALLOWED_EXTENSIONS.includes(ext);
    });

    if (!matchedFile) return res.status(404).send('Not Found');

    const filePath = path.join(IMAGE_FOLDER, matchedFile);

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`SEND ERROR: ${matchedFile}`, err);
        if (!res.headersSent) res.status(500).send('File Transfer Error');
      } else console.log(`[ACCESS] ${req.ip} -> ${matchedFile}`);
    });
  });
});

app.listen(port, () => {
  console.log(`[INFO] Server Started! http://localhost:${port}`);
});