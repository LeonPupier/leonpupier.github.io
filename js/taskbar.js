export function addTaskbarAppIcon(id, iconSrc = "assets/icons/default.png") {
    const taskbar = document.getElementById('taskbar-apps');
    if (document.getElementById('taskbar-app-' + id)) return;

    const btn = document.createElement('div');
    btn.className = "taskbar-app-icon";
    btn.id = "taskbar-app-" + id;
    btn.innerHTML = `<img src="${iconSrc}" alt="${id}"/>`;

    const desktopIcon = document.querySelector(`.desktop-icon[data-app="${id}"] span`);
    const spanText = desktopIcon ? desktopIcon.textContent.trim() : id.charAt(0).toUpperCase() + id.slice(1);

    btn.setAttribute('data-title', spanText);

    const tooltip = document.getElementById('taskbar-tooltip');
    let tooltipTimeout;

    btn.addEventListener('mouseenter', (e) => {
        const title = btn.getAttribute('data-title');
        if (!title) return;

        tooltipTimeout = setTimeout(() => {
            tooltip.textContent = title;
            tooltip.style.display = 'block';
            tooltip.classList.add('visible');
            const rect = btn.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        }, 500);
    });

    btn.addEventListener('mouseleave', () => {
        clearTimeout(tooltipTimeout);
        tooltip.classList.remove('visible');
    });

    btn.onclick = () => {
        const win = document.getElementById(id + "-window");
        if (!win) return;

        // If the window is minimized or hidden, displayed it
        if (win.classList.contains("minimized") || win.classList.contains("hidden")) {
            win.classList.remove("minimized");
            win.classList.remove("hidden");
            win.classList.remove("minimizing");
            if (window.bringWindowToFront) window.bringWindowToFront(win);
            if (window.setTaskbarActiveIcon) window.setTaskbarActiveIcon(id);
            return;
        }

        // If the window is displayed, focus it
        const topZ = Math.max(...Array.from(document.querySelectorAll('.window'))
            .map(w => parseInt(w.style.zIndex || 0, 10)));
        if (parseInt(win.style.zIndex || 0, 10) < topZ) {
            if (window.bringWindowToFront) window.bringWindowToFront(win);
            if (window.setTaskbarActiveIcon) window.setTaskbarActiveIcon(id);
            return;
        }

        // Else, minimize the window
        window.toggleMinimizeWindow(id);
    };
    
    taskbar.appendChild(btn);
}

export function removeTaskbarAppIcon(id) {
    const icon = document.getElementById('taskbar-app-' + id);
    if (icon) {
        icon.classList.add('hide');
        icon.addEventListener('animationend', () => {
            icon.remove();
        }, { once: true });
    }
}

export function setTaskbarActiveIcon(id) {
    document.querySelectorAll('.taskbar-app-icon').forEach(icon => {
        if (icon.id === 'taskbar-app-' + id) {
            if (icon.classList.contains('active')) return;
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
}

// Global access for taskbar
window.setTaskbarActiveIcon = setTaskbarActiveIcon;
window.bringWindowToFront = null;
