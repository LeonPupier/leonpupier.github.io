import { addTaskbarAppIcon, removeTaskbarAppIcon } from './taskbar.js';
import { initWindows, bringWindowToFront } from './windows.js';

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

// Pour accès global depuis taskbar.js
window.bringWindowToFront = bringWindowToFront;

document.addEventListener('DOMContentLoaded', () => {
    initWindows();
});
