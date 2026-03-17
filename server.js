const express = require('express');
const cors = require('cors');
const { downloadTikTok } = require('./providers/tiktok');

const app = express();
const PORT = process.env.PORT || 3000; // Auto port buat shared hosting/cloud

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function detectPlatform(inputUrl) {
    let parsed;
    try {
        parsed = new URL(inputUrl);
    } catch {
        return 'unknown';
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'unknown';

    const host = (parsed.hostname || '').toLowerCase();
    if (host === 'www.tiktok.com' || host === 'tiktok.com' || host.endsWith('.tiktok.com') || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') return 'tiktok';
    return 'unknown';
}

app.post('/api/download', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'Linknya mana bray?' });

        const platform = detectPlatform(url);
        console.log(`Lagi proses (${platform}) buat: ${url}`);

        let data;
        if (platform === 'tiktok') {
            data = await downloadTikTok(url);
        } else {
            return res.status(400).json({ success: false, message: 'Link ini belum didukung bray. Pake link TikTok aja ya.' });
        }

        return res.json({ success: true, data });
    } catch (error) {
        console.error('Waduh error bray:', error.message);
        return res.status(500).json({ success: false, message: 'Gagal download bray. ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Santuy! Server nyala di Port ${PORT}`);
});
