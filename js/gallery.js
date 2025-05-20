export function initGallery() {
    // Open Lightbox on image click
    document.querySelectorAll('.gallery-grid img').forEach(img => {
        img.addEventListener('click', function() {
            const lightbox = document.getElementById('gallery-lightbox');
            const lightboxImg = document.getElementById('gallery-lightbox-img');
            const caption = document.getElementById('gallery-lightbox-caption');
            lightboxImg.src = this.src;
            caption.textContent = this.getAttribute('data-title') || this.alt || '';
            lightbox.classList.remove('hidden');
            document.querySelector('.gallery-content')?.classList.add('noscroll');
        });
    });

    // Close Lightbox on backdrop click
    document.querySelector('.gallery-lightbox-backdrop')?.addEventListener('click', function() {
        document.getElementById('gallery-lightbox').classList.add('hidden');
        document.querySelector('.gallery-content')?.classList.remove('noscroll');
    });
}
