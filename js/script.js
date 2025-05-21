import { addTaskbarAppIcon, removeTaskbarAppIcon } from './taskbar.js';
import { initWindow, bringWindowToFront } from './windows.js';
import { initNotifications, pushNotification } from './notifications.js';

import { initGallery } from './gallery.js';


// --------------------------------------------------------
// Window management
// --------------------------------------------------------


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
    win.classList.remove("minimized");
    win.classList.remove("minimizing");
    if (window.bringWindowToFront) window.bringWindowToFront(win);
};

window.toggleMinimizeWindow = function(id) {
    const win = document.getElementById(id + "-window");
    if (!win) return;
    if (win.classList.contains("minimized")) {
        win.classList.remove("minimized");
        win.classList.remove("hidden");
        win.classList.remove("minimizing");
        if (window.bringWindowToFront) window.bringWindowToFront(win);
        if (window.setTaskbarActiveIcon) window.setTaskbarActiveIcon(id);
    } else {
        win.classList.add("minimizing");
        win.addEventListener('animationend', function handler() {
            win.classList.remove("minimizing");
            win.classList.add("minimized");
            win.classList.add("hidden");
            win.removeEventListener('animationend', handler);
            const taskbarIcon = document.getElementById('taskbar-app-' + id);
            if (taskbarIcon) taskbarIcon.classList.remove('active');
        });
    }
};

window.closeWindow = function(id) {
    const win = document.getElementById(id + "-window");
    if (!win) return;
    win.classList.add("closing");
    win.addEventListener('animationend', function handler() {
        win.classList.remove("closing");
        win.classList.add("hidden");
        win.removeEventListener('animationend', handler);
        removeTaskbarAppIcon(id);
    });
};

window.bringWindowToFront = bringWindowToFront;


// --------------------------------------------------------
// Clock
// --------------------------------------------------------

function updateClock() {
    const clock = document.getElementById('clock');
    if (!clock) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    clock.textContent = `${h}:${m}`;
}


// --------------------------------------------------------
// Visual selection on the desktop
// --------------------------------------------------------


let isSelecting = false;
let selectStart = { x: 0, y: 0 };
const desktop = document.getElementById('desktop');
const selectionBox = document.getElementById('desktop-selection');

desktop.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (!e.target.closest('.desktop-icon')) {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
        selectionBox.style.display = 'none';
        isSelecting = false;
    }
});

desktop.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.target.closest('.desktop-icon')) return;
    isSelecting = true;
    selectStart = { x: e.clientX, y: e.clientY };
    selectionBox.style.left = selectStart.x + 'px';
    selectionBox.style.top = selectStart.y + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
});

window.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    const x1 = Math.min(selectStart.x, e.clientX);
    const y1 = Math.min(selectStart.y, e.clientY);
    const x2 = Math.max(selectStart.x, e.clientX);
    const y2 = Math.max(selectStart.y, e.clientY);
    selectionBox.style.left = x1 + 'px';
    selectionBox.style.top = y1 + 'px';
    selectionBox.style.width = (x2 - x1) + 'px';
    selectionBox.style.height = (y2 - y1) + 'px';

    document.querySelectorAll('.desktop-icon').forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const ix1 = rect.left, iy1 = rect.top, ix2 = rect.right, iy2 = rect.bottom;
        if (x1 < ix2 && x2 > ix1 && y1 < iy2 && y2 > iy1) {
            icon.classList.add('selected');
        } else {
            icon.classList.remove('selected');
        }
    });
});

window.addEventListener('mouseup', () => {
    if (isSelecting) {
        isSelecting = false;
        selectionBox.style.display = 'none';
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && document.activeElement === document.body) {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            const appId = icon.dataset.app;
            if (appId) openWindow(appId);
        });
    }
});


// --------------------------------------------------------
// Drag and drop icons on the desktop
// --------------------------------------------------------

const GRID_WIDTH = 96;
const GRID_HEIGHT = 104;
const GRID_GAP = 16;
const GRID_OFFSET_X = 20;
const GRID_OFFSET_Y = 20;
const DRAG_THRESHOLD = 4;

let dragIcon = null;
let dragOffset = { x: 0, y: 0 };
let dragSelection = [];
let dragSelectionStart = [];
let wasDragging = false;
let lastMousePos = { x: 0, y: 0 };

document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;

        wasDragging = false;
        lastMousePos = { x: e.clientX, y: e.clientY };

        if (!icon.classList.contains('selected')) {
            document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        }

        dragIcon = icon;
        dragSelection = Array.from(document.querySelectorAll('.desktop-icon.selected'));
        dragSelectionStart = dragSelection.map(selIcon => ({
            icon: selIcon,
            left: parseInt(selIcon.style.left, 10),
            top: parseInt(selIcon.style.top, 10)
        }));

        const rect = icon.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        icon.style.zIndex = 1001;
        e.preventDefault();
    });

    // just select icon on click
    icon.addEventListener('click', (e) => {
        if (wasDragging) {
            e.stopImmediatePropagation();
            e.preventDefault();
            wasDragging = false;
            return;
        }
        document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });

    // Open app on double-click
    icon.addEventListener('dblclick', (e) => {
        document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));

        const appId = icon.dataset.app;
        if (appId) openWindow(appId);

        const img = icon.querySelector('img');
        if (img) {
            img.classList.remove('bounce');
            void img.offsetWidth;
            img.classList.add('bounce');
        }
    });
});

window.addEventListener('mousemove', (e) => {
    if (!dragIcon) return;

    if (
        Math.abs(e.clientX - lastMousePos.x) > DRAG_THRESHOLD ||
        Math.abs(e.clientY - lastMousePos.y) > DRAG_THRESHOLD
    ) {
        wasDragging = true;
    }

    const desktopRect = desktop.getBoundingClientRect();
    let x = e.clientX - desktopRect.left - dragOffset.x;
    let y = e.clientY - desktopRect.top - dragOffset.y;

    // Snap to grid
    x = Math.round((x - GRID_OFFSET_X) / (GRID_WIDTH + GRID_GAP)) * (GRID_WIDTH + GRID_GAP) + GRID_OFFSET_X;
    y = Math.round((y - GRID_OFFSET_Y) / (GRID_HEIGHT + GRID_GAP)) * (GRID_HEIGHT + GRID_GAP) + GRID_OFFSET_Y;

    // Calculate the offset from the original position of the dragged icon
    const dragIconStart = dragSelectionStart.find(obj => obj.icon === dragIcon);
    const dx = x - dragIconStart.left;
    const dy = y - dragIconStart.top;

    // Calculate future positions for all selected icons
    const futurePositions = dragSelectionStart.map(({left, top}) => ({
        left: left + dx,
        top: top + dy
    }));

    // Check that all positions are within desktop bounds
    const taskbar = document.querySelector('.taskbar');
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 56;
    const maxY = window.innerHeight - taskbarHeight - GRID_HEIGHT - GRID_OFFSET_Y;
    const maxX = window.innerWidth - GRID_WIDTH - GRID_OFFSET_X;

    let canMove = true;
    for (const pos of futurePositions) {
        if (
            pos.left < GRID_OFFSET_X ||
            pos.left > maxX ||
            pos.top < GRID_OFFSET_Y ||
            pos.top > maxY
        ) {
            canMove = false;
            break;
        }
    }

    // Check for duplicates within the selection itself
    if (canMove) {
        const positionsSet = new Set();
        for (const pos of futurePositions) {
            const key = `${pos.left},${pos.top}`;
            if (positionsSet.has(key)) {
                canMove = false;
                break;
            }
            positionsSet.add(key);
        }
    }

    // Check for collision with non-selected icons
    if (canMove) {
        document.querySelectorAll('.desktop-icon').forEach(other => {
            if (!dragSelection.includes(other)) {
                const otherLeft = parseInt(other.style.left, 10);
                const otherTop = parseInt(other.style.top, 10);
                if (futurePositions.some(pos => pos.left === otherLeft && pos.top === otherTop)) {
                    canMove = false;
                }
            }
        });
    }

    // Move all selected icons if all checks pass
    if (canMove) {
        dragSelectionStart.forEach(({icon, left, top}, i) => {
            icon.style.left = futurePositions[i].left + "px";
            icon.style.top = futurePositions[i].top + "px";
        });
    }
});

window.addEventListener('mouseup', () => {
    if (dragIcon) {
        dragIcon.style.zIndex = "";
        dragIcon = null;
        dragSelection = [];
        dragSelectionStart = [];
    }
});

const rows = document.querySelectorAll('.desktop-row');
let rowIndex = 0;
rows.forEach((row) => {
    const icons = row.querySelectorAll('.desktop-icon');
    icons.forEach((icon, colIndex) => {
        icon.style.left = (GRID_OFFSET_X + colIndex * (GRID_WIDTH + GRID_GAP)) + "px";
        icon.style.top = (GRID_OFFSET_Y + rowIndex * (GRID_HEIGHT + GRID_GAP)) + "px";
    });
    rowIndex++;
});

const allIcons = Array.from(document.querySelectorAll('.desktop-icon'));
allIcons.forEach((icon, i) => {
    icon.style.animationDelay = (i * 0.07) + 's';
    icon.style.opacity = '0';
    icon.style.transform = 'scale(0.6)';
    void icon.offsetWidth;
    icon.classList.remove('desktop-icon-animated');
    setTimeout(() => {
        icon.classList.add('desktop-icon-animated');
    }, 10);
});


// --------------------------------------------------------
// Taskbar informations
// --------------------------------------------------------


const infoList = [
    { title: "Credits", icon: "credits", text: "Made by Léon Pupier - 2025" },
    { title: "Weather", icon: "weather", text: "Idk what tomorrow's weather will be like." },
    { title: "Shortcut", icon: "shortcut", text: "You can drag icons to rearrange your desktop." },
    { title: "Motivation", icon: "motivation", text: "Stay curious. Keep exploring!" },
    { title: "Shortcut", icon: "shortcut", text: "Press Enter to open selected icons." },
    { title: "Contact", icon: "contact", text: "Looking for a job? Let's connect!" },
    { title: "Shortcut", icon: "shortcut", text: "You can resize windows by dragging the corners." },
];

let infoIndex = 0;

function updateTaskbarInfo() {
    const box = document.getElementById('taskbar-info-box');
    const title = document.getElementById('taskbar-info-title');
    const text = document.getElementById('taskbar-info-text');
    const iconBox = document.getElementById('taskbar-info-icon');
    const icon = iconBox ? iconBox.querySelector('img') : null;
    if (box && title && text && icon && iconBox) {
        // Fade out
        box.classList.remove('fade-in');
        box.classList.add('fade-out');
        iconBox.classList.remove('fade-in');
        iconBox.classList.add('fade-out');
        setTimeout(() => {
            title.textContent = infoList[infoIndex].title;
            text.textContent = infoList[infoIndex].text;
            icon.src = `assets/icons/${infoList[infoIndex].icon}.png`;
            // Fade in
            box.classList.remove('fade-out');
            box.classList.add('fade-in');
            iconBox.classList.remove('fade-out');
            iconBox.classList.add('fade-in');
        }, 350);
    }
    infoIndex = (infoIndex + 1) % infoList.length;
}


// --------------------------------------------------------
// Context menu for desktop icons
// --------------------------------------------------------


const contextMenu = document.getElementById('desktop-context-menu');
const changeWallpaperBtn = document.getElementById('change-wallpaper-btn');

// Display the context menu
desktop.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    contextMenu.classList.remove('fade-in');
    void contextMenu.offsetWidth;
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.style.display = 'block';
    contextMenu.classList.add('fade-in');
});

// Hide the context menu when clicking outside
document.addEventListener('click', function(e) {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
        contextMenu.classList.remove('fade-in');
    }
});

// Option to change wallpaper
changeWallpaperBtn.addEventListener('click', function() {
    contextMenu.style.display = 'none';
    const wallpapers = [
        'assets/wallpapers/1.jpg',
        'assets/wallpapers/2.jpg',
        'assets/wallpapers/3.jpg',
        'assets/wallpapers/4.jpg',
    ];
    const wallpaperImg = document.querySelector('.wallpaper img');
    if (wallpaperImg) {
        // Randomly select a new wallpaper
        let current = wallpaperImg.src.split('/').pop();
        let next;
        do {
            next = wallpapers[Math.floor(Math.random() * wallpapers.length)];
        } while (next.endsWith(current));
        wallpaperImg.src = next;
    }
});


// --------------------------------------------------------
// DOMContentLoaded
// --------------------------------------------------------


document.addEventListener('DOMContentLoaded', () => {
    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    setInterval(updateTaskbarInfo, 5000);
    updateTaskbarInfo();

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
