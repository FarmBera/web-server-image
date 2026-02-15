const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const {inject} = require("@vercel/analytics");


const app = express();
const port = 3001;

// app.set('trust proxy', 1); // top proxy
app.use(helmet()); // secure header

// request limit: 5m / total: 50
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: 'Too Many Request!',
});
app.use(limiter);


const IMAGE_FOLDER = path.join(__dirname, 'img');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];


// if (!fs.existsSync(IMAGE_FOLDER)) {
//   fs.mkdirSync(IMAGE_FOLDER);
// }

app.get('/', async (req, res) => {
    inject();
    const requestName = req.query.name;

    // verify args
    if (!requestName || requestName.length > 255) {
        const msg = 'Bad Request'
        res.status(400).send(msg);
        return
    }

    // parse
    const parsedName = requestName.replace(/[^a-zA-Z0-9-_]/g, '');
    if (parsedName !== requestName) {
        const msg = `Wrong Format: ${requestName}`
        res.status(400).send(msg);
        return
    }

    fs.readdir(IMAGE_FOLDER, async (err, files) => {
        if (err) {
            const msg = 'Internal Server Error'
            console.error('SERVER ERROR:', err);
            res.status(500).send(msg);
            return
        }

        // find file
        const matchedFile = files.find(file => {
            const parsed = path.parse(file);
            const name = parsed.name;
            const ext = parsed.ext.toLowerCase();

            // matched file is equal && is allowed img extension
            return name === parsedName && ALLOWED_EXTENSIONS.includes(ext);
        });

        if (!matchedFile) {
            const msg = 'Not Found'
            res.status(404).send(msg);
            return
        }

        const filePath = path.join(IMAGE_FOLDER, matchedFile);

        // send file
        res.sendFile(filePath, async (err) => {
            if (err) {
                console.error(`SEND ERROR: ${matchedFile}`, err);
                if (!res.headersSent) {
                    const msg = 'File Transfer Error'
                    res.status(500).send(msg);
                }
            }
            // else console.log(`[ACCESS] ${req.ip} -> ${matchedFile}`);
        });
    });
});

app.listen(port, () => {
    console.log(`[INFO] Server Started! http://localhost:${port}`);
});

module.exports = app;