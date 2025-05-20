import { addTaskbarAppIcon, removeTaskbarAppIcon } from './taskbar.js';
import { initWindows, bringWindowToFront } from './windows.js';
import { initNotifications, pushNotification } from './notifications.js';


window.openWindow = function(id) {
    document.getElementById(id + "-window").classList.remove("hidden");
    let iconSrc = "assets/icons/default.png";
    if (id === "projet1") iconSrc = "assets/icons/default.png";
    if (id === "projet2") iconSrc = "assets/icons/default.png";
    addTaskbarAppIcon(id, iconSrc);
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
    initWindows();
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
