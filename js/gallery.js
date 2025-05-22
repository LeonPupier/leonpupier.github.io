export function initGallery() {
    // Add a container & label to each image
    document.querySelectorAll('.gallery-grid img').forEach((img, i) => {
        if (!img.parentElement.classList.contains('gallery-img-container')) {
            const container = document.createElement('div');
            container.className = 'gallery-img-container';
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);

            // Add a label if the image has a title
            const title = img.getAttribute('data-title');
            if (title) {
                const label = document.createElement('div');
                label.className = 'gallery-hover-label';
                label.textContent = title;
                container.appendChild(label);
            }
        }

        // Animate the images
        img.style.opacity = 0;
        img.style.transform = 'scale(0.92) translateY(24px)';
        img.style.animation = 'gallery-img-in 0.44s cubic-bezier(.4,1.7,.6,.97) forwards';
        img.style.animationDelay = (i * 0.07) + 's';
    });

    // Open Lightbox on image click
    let currentIndex = 0;
    let images = Array.from(document.querySelectorAll('.gallery-grid img'));

    function showImage(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;
        const img = images[currentIndex];
        const lightboxImg = document.getElementById('gallery-lightbox-img');
        const caption = document.getElementById('gallery-lightbox-caption');
        lightboxImg.src = img.src;
        caption.textContent = img.getAttribute('data-title') || img.alt || '';

        lightboxImg.style.animation = 'none';
        void lightboxImg.offsetWidth;
        lightboxImg.style.animation = '';
    }

    document.querySelectorAll('.gallery-grid img').forEach((img, i) => {
        img.addEventListener('click', function() {
            images = Array.from(document.querySelectorAll('.gallery-grid img'));
            showImage(i);
            document.getElementById('gallery-lightbox').classList.remove('hidden');
            document.querySelector('.gallery-content')?.classList.add('noscroll');
        });
    });

    // Change image on arrow click
    document.querySelector('.gallery-lightbox-arrow.left')?.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });
    document.querySelector('.gallery-lightbox-arrow.right')?.addEventListener('click', function(e) {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // Close Lightbox on backdrop click
    document.querySelector('.gallery-lightbox-backdrop')?.addEventListener('click', function() {
        document.getElementById('gallery-lightbox').classList.add('hidden');
        document.querySelector('.gallery-content')?.classList.remove('noscroll');
    });

    // 3D effect on hover
    document.querySelectorAll('.gallery-img-container').forEach(container => {
        let animFrame;
        let lastTransform = '';

        container.addEventListener('mousemove', e => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const ratio = rect.width / rect.height;
            const angleFactor = ratio > 1.5 ? 0.5 : 1;
            const rotateY = ((x - centerX) / centerX) * 18 * angleFactor;
            const rotateX = ((centerY - y) / centerY) * 12 * angleFactor;
            const transform = `perspective(700px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.08)`;

            if (transform !== lastTransform) {
                lastTransform = transform;
                if (animFrame) cancelAnimationFrame(animFrame);
                animFrame = requestAnimationFrame(() => {
                    container.style.transform = transform;
                    container.style.zIndex = 2;
                });
            }
        });

        container.addEventListener('mouseleave', () => {
            if (animFrame) cancelAnimationFrame(animFrame);
            container.style.transform = '';
            container.style.zIndex = '';
            lastTransform = '';
        });
    });

    // Animate the images border on hover
    document.querySelectorAll('.gallery-img-container').forEach(container => {
        let anim;
        container.addEventListener('mouseenter', () => {
            let angle = 0;
            function spin() {
                angle = (angle + 1) % 360;
                container.style.setProperty('--angle', angle + 'deg');
                anim = requestAnimationFrame(spin);
            }
            spin();
        });
        container.addEventListener('mouseleave', () => {
            cancelAnimationFrame(anim);
            container.style.setProperty('--angle', '45deg');
        });
    });
}