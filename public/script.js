document.getElementById('downloadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const errorMessage = document.getElementById('errorMessage');
    const panel = document.querySelector('.panel');
    
    // Reset UI
    errorMessage.classList.add('d-none');
    resultSection.classList.add('d-none');
    
    // Validate Input
    if (!urlInput.value) return;

    // Show Loader
    loader.classList.remove('d-none');
    downloadBtn.disabled = true;
    downloadBtn.innerText = 'Loading...';
    if (panel) panel.classList.add('is-loading');

    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: urlInput.value })
        });

        const data = await response.json();

        if (data.success) {
            // Update UI with Data
            const titleEl = document.getElementById('videoTitle');
            titleEl.innerText = data.data.title || 'Video';
            // Restart CSS animation each time new result shows
            titleEl.classList.remove('title-anim');
            void titleEl.offsetWidth;
            titleEl.classList.add('title-anim');

            const author = data.data.author || '';
            document.getElementById('videoAuthor').innerText = author ? (author.startsWith('@') ? author : '@' + author) : '';
            
            const videoPreview = document.getElementById('videoPreview');
            videoPreview.src = data.data.videoUrl;
            videoPreview.poster = data.data.cover || '';
            
            document.getElementById('downloadLink').href = data.data.videoUrl;

            const musicLink = document.getElementById('musicLink');
            if (data.data.music) {
                musicLink.href = data.data.music;
                musicLink.classList.remove('d-none');
            } else {
                musicLink.href = '#';
                musicLink.classList.add('d-none');
            }
            
            // Show Result
            resultSection.classList.remove('d-none');
            resultSection.classList.add('animate__animated', 'animate__backInUp');
        } else {
            throw new Error(data.message || 'Gagal download video.');
        }

    } catch (error) {
        console.error(error);
        errorMessage.innerText = error.message;
        errorMessage.classList.remove('d-none');
    } finally {
        // Reset Loader
        loader.classList.add('d-none');
        downloadBtn.disabled = false;
        downloadBtn.innerText = 'Sikat';
        if (panel) panel.classList.remove('is-loading');
    }
});

function resetForm() {
    document.getElementById('urlInput').value = '';
    document.getElementById('resultSection').classList.add('d-none');
    document.getElementById('videoPreview').pause();
    document.getElementById('videoPreview').src = '';
}
