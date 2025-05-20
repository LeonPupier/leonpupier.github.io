import { addTaskbarAppIcon, removeTaskbarAppIcon } from './taskbar.js';
import { initWindow, bringWindowToFront } from './windows.js';
import { initNotifications, pushNotification } from './notifications.js';

import { initGallery } from './gallery.js';


function centerWindow(win) {
    const rect = win.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const left = Math.max(0, (vw - rect.width) / 2);
    const top = Math.max(0, (vh - rect.height) / 2);
    win.style.left = left + "px";
    win.style.top = top + "px";
}

window.openWindow = function(id) {
    const win = document.getElementById(id + "-window");
    if (!win) return;
    addTaskbarAppIcon(id, `assets/icons/${id}.png`);
    if (!win.dataset.loaded) {
        fetch(`apps/${id}.html`)
            .then(res => res.text())
            .then(html => {
                win.innerHTML = html;
                win.dataset.loaded = "1";
                initWindow(win);

                if (id === "gallery") initGallery();

                setTimeout(() => centerWindow(win), 0);
            });
    } else {
        if (id === "gallery") initGallery();
        setTimeout(() => centerWindow(win), 0);
    }
    win.classList.remove("hidden");
    if (window.bringWindowToFront) window.bringWindowToFront(win);
};

window.closeWindow = function(id) {
    document.getElementById(id + "-window").classList.add("hidden");
    removeTaskbarAppIcon(id);
};

window.bringWindowToFront = bringWindowToFront;

function updateClock() {
    const clock = document.getElementById('clock');
    if (!clock) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    clock.textContent = `${h}:${m}`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.window').forEach(win => initWindow(win));
    initNotifications();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Welcome notifications
    setTimeout(() => {
        pushNotification("Welcome on LéonOS 👋", "Léon", "welcome");
    }, 2000);
    setTimeout(() => {
        pushNotification("Have fun exploring the system and its features! 👍", "Léon", "welcome");
    }, 4000);
});
