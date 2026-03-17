const { spawn } = require('child_process');

function runYtDlpJson(url) {
    return new Promise((resolve, reject) => {
        const args = [
            '--dump-single-json',
            '--no-warnings',
            '--no-playlist',
            '--skip-download',
            url,
        ];

        const child = spawn('yt-dlp', args, { windowsHide: true });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (buf) => {
            stdout += buf.toString('utf8');
        });
        child.stderr.on('data', (buf) => {
            stderr += buf.toString('utf8');
        });

        child.on('error', (err) => {
            if (err && err.code === 'ENOENT') {
                reject(new Error('yt-dlp belum ke-install di server. Install dulu: https://github.com/yt-dlp/yt-dlp'));
                return;
            }
            reject(err);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(stderr.trim() || `yt-dlp gagal (exit ${code})`));
                return;
            }

            try {
                resolve(JSON.parse(stdout));
            } catch {
                reject(new Error('yt-dlp output bukan JSON (mungkin kena challenge/login Instagram).'));
            }
        });
    });
}

function toArrayEntries(info) {
    if (!info) return [];
    if (Array.isArray(info.entries) && info.entries.length) return info.entries;
    return [info];
}

function pickBestVideoUrl(entry) {
    if (!entry) return '';
    if (typeof entry.url === 'string' && entry.url) return entry.url;

    const formats = Array.isArray(entry.formats) ? entry.formats : [];
    const videoFormats = formats.filter((f) => typeof f?.url === 'string' && f.url && f.vcodec && f.vcodec !== 'none');
    videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0));
    if (videoFormats[0]?.url) return videoFormats[0].url;

    const anyFormats = formats.filter((f) => typeof f?.url === 'string' && f.url);
    anyFormats.sort((a, b) => (b.tbr || 0) - (a.tbr || 0));
    return anyFormats[0]?.url || '';
}

function pickBestThumbnail(entry) {
    if (!entry) return '';
    if (typeof entry.thumbnail === 'string' && entry.thumbnail) return entry.thumbnail;
    const thumbs = Array.isArray(entry.thumbnails) ? entry.thumbnails : [];
    thumbs.sort((a, b) => (b.width || 0) - (a.width || 0) || (b.height || 0) - (a.height || 0));
    return thumbs[0]?.url || '';
}

async function downloadInstagram(url) {
    const info = await runYtDlpJson(url);

    const entries = toArrayEntries(info);
    if (!entries.length) throw new Error('Gagal baca data Instagram.');

    // Ambil item yang paling masuk akal buat video (reels/post).
    const entry =
        entries.find((e) => e && (e.vcodec && e.vcodec !== 'none')) ||
        entries.find((e) => e && typeof e.url === 'string') ||
        entries[0];

    const videoUrl = pickBestVideoUrl(entry);
    if (!videoUrl) throw new Error('Gagal dapetin direct video URL (mungkin butuh cookies/login).');

    return {
        title: entry.title ?? info.title ?? 'Video Instagram',
        author: entry.uploader ?? info.uploader ?? entry.uploader_id ?? info.uploader_id ?? 'Instagram User',
        cover: pickBestThumbnail(entry) || pickBestThumbnail(info),
        videoUrl,
        music: '',
    };
}

module.exports = { downloadInstagram };

