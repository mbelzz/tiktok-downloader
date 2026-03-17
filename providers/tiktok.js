const axios = require('axios');

async function downloadTikTok(url) {
    const response = await axios.get('https://www.tikwm.com/api/', { params: { url, hd: 1 } });
    const result = response.data;

    if (!result || result.code !== 0 || !result.data) {
        throw new Error(result?.msg || 'API lagi down atau link salah bray.');
    }

    return {
        title: result.data.title ?? 'Video TikTok',
        author: result.data.author?.nickname ?? 'TikTok User',
        cover: result.data.cover ?? '',
        videoUrl: result.data.play ?? '',
        music: result.data.music ?? '',
    };
}

module.exports = { downloadTikTok };

