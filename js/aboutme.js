export function initAboutMe() {
    const steps = document.querySelectorAll('.aboutme-step');
    const aboutmeContent = document.querySelector('.aboutme-content');

    // Animate sections when they enter the viewport
    const observer = new window.IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.4 });

    steps.forEach(step => observer.observe(step));

    // Update the background color on specific section
    function updateThemeOnScroll() {
        let minDist = Infinity;
        let currentTheme = '';
        const contentRect = aboutmeContent.getBoundingClientRect();
        const appCenter = contentRect.top + contentRect.height / 2;

        steps.forEach(step => {
            const rect = step.getBoundingClientRect();
            if (rect.bottom > contentRect.top && rect.top < contentRect.bottom) {
                const stepCenter = rect.top + rect.height / 2;
                const dist = Math.abs(stepCenter - appCenter);
                if (dist < minDist) {
                    minDist = dist;
                    const themeClass = Array.from(step.classList).find(c => c.startsWith('theme-'));
                    if (themeClass) currentTheme = themeClass;
                }
            }
        });

        aboutmeContent.classList.remove('theme-intro', 'theme-passion', 'theme-hobbies');
        if (currentTheme) aboutmeContent.classList.add(currentTheme);
    }

    aboutmeContent.addEventListener('scroll', updateThemeOnScroll, { passive: true });
    window.addEventListener('resize', updateThemeOnScroll);
    setTimeout(updateThemeOnScroll, 100);
}
