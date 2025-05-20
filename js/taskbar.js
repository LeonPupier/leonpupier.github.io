export function addTaskbarAppIcon(id, iconSrc = "assets/icons/default.png") {
    const taskbar = document.getElementById('taskbar-apps');
    if (document.getElementById('taskbar-app-' + id)) return;

    const btn = document.createElement('div');
    btn.className = "taskbar-app-icon";
    btn.id = "taskbar-app-" + id;
    btn.innerHTML = `<img src="${iconSrc}" alt="${id}"/>`;
    btn.onclick = () => {
        const win = document.getElementById(id + "-window");
        win.classList.remove("hidden");
        if (window.bringWindowToFront) window.bringWindowToFront(win);
    };
    taskbar.appendChild(btn);
}

export function removeTaskbarAppIcon(id) {
    const icon = document.getElementById('taskbar-app-' + id);
    if (icon) icon.remove();
}

export function setTaskbarActiveIcon(id) {
    document.querySelectorAll('.taskbar-app-icon').forEach(icon => icon.classList.remove('active'));
    const icon = document.getElementById('taskbar-app-' + id);
    if (icon) icon.classList.add('active');
}

// Global access for taskbar
window.setTaskbarActiveIcon = setTaskbarActiveIcon;
window.bringWindowToFront = null;
