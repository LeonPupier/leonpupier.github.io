export function addTaskbarAppIcon(id, iconSrc = "assets/icons/default.png") {
    const taskbar = document.getElementById('taskbar-apps');
    if (document.getElementById('taskbar-app-' + id)) return;

    const btn = document.createElement('div');
    btn.className = "taskbar-app-icon";
    btn.id = "taskbar-app-" + id;
    btn.innerHTML = `<img src="${iconSrc}" alt="${id}"/>`;

    btn.onclick = () => {
        const win = document.getElementById(id + "-window");
        if (!win) return;
        if (win.classList.contains("hidden") || win.classList.contains("minimized")) {
            win.classList.remove("minimized");
            win.classList.remove("hidden");
            if (window.bringWindowToFront) window.bringWindowToFront(win);
        } else {
            win.classList.add("minimized");
            win.classList.add("hidden");
        }
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
