import { addTaskbarAppIcon, removeTaskbarAppIcon } from './taskbar.js';
import { initWindow, bringWindowToFront } from './windows.js';
import { initNotifications, pushNotification } from './notifications.js';

import { initAboutMe } from './aboutme.js';
import { initGallery } from './gallery.js';
import { initTerminal } from './terminal.js';


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

                if (id === 'aboutme') initAboutMe();
                if (id === "gallery") initGallery();
                if (id === 'terminal') initTerminal();

                setTimeout(() => centerWindow(win), 0);
            });
    } else {
        if (id === 'aboutme') initAboutMe();
        if (id === "gallery") initGallery();
        if (id === 'terminal') initTerminal();

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

// Unfocus all apps in the taskbar when clicking on the desktop
desktop.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !e.target.closest('.window')) {
        document.querySelectorAll('.taskbar-app-icon.active').forEach(icon => {
            icon.classList.remove('active');
        });
    }
});

// Unselect all icons when clicking outside of them
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

// Start selection box on mousedown
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

// Update selection box and selected icons on mousemove
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

// Hide selection box on mouseup
window.addEventListener('mouseup', () => {
    if (isSelecting) {
        isSelecting = false;
        selectionBox.style.display = 'none';
    }
});

// Open selected icons on Enter key press
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

    // Check the easter egg condition
    if (areMainAppsInSquare()) {
        easter_egg();
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


// --------------------------------------------------------
// Taskbar informations
// --------------------------------------------------------


const infoList = [
    { title: "Credits", icon: "credits", text: "Made by Léon Pupier - 2025" },
    { title: "Weather", icon: "weather", text: "Idk what tomorrow's weather will be like." },
    { title: "Shortcut", icon: "shortcut", text: "You can drag icons to rearrange your desktop." },
    { title: "Motivation", icon: "motivation", text: "Stay curious. Keep exploring!" },
    { title: "Shortcut", icon: "shortcut", text: "Press Enter to open selected icons." },
    { title: "Contact", icon: "contact", text: "Looking for a developer? Let's connect!" },
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

// Animate the taskbar icon on click
document.querySelectorAll('.start-btn').forEach(btn => {
    const img = btn.querySelector('img, svg');
    if (!img) return;
    btn.addEventListener('mousedown', () => {
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = 'notif-click 0.18s cubic-bezier(.4,1.7,.6,.97)';
        setTimeout(() => {
            img.style.animation = 'none';
        }, 180);
    });
});

// Animate the notification icon on click
document.querySelectorAll('.notification-icon').forEach(icon => {
    const img = icon.querySelector('img');
    if (!img) return;
    icon.addEventListener('mousedown', () => {
        img.style.animation = 'none';
        void img.offsetWidth;
        img.style.animation = 'notif-click 0.18s cubic-bezier(.4,1.7,.6,.97)';
        setTimeout(() => {
            img.style.animation = 'none';
        }, 180);
    });
});


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
    const wallpaperDiv = document.querySelector('.wallpaper');
    const wallpaperImg = wallpaperDiv.querySelector('img');
    if (wallpaperImg && wallpaperDiv) {
        let current = wallpaperImg.src.split('/').pop();
        let next;
        do {
            next = wallpapers[Math.floor(Math.random() * wallpapers.length)];
        } while (next.endsWith(current));

        // Display the new wallpaper
        const tempImg = new Image();
        tempImg.onload = function() {
            const newImg = document.createElement('img');
            newImg.src = next;
            newImg.style.opacity = 0;
            newImg.style.position = 'absolute';
            newImg.style.inset = 0;
            newImg.style.width = '100vw';
            newImg.style.height = '100vh';
            newImg.style.objectFit = 'cover';
            newImg.style.transition = 'opacity 0.5s';

            wallpaperDiv.appendChild(newImg);

            void newImg.offsetWidth;

            newImg.style.opacity = 1;
            newImg.style.animation = 'wallpaper-zoom-wave 1s ease-in-out forwards';

            setTimeout(() => {
                wallpaperImg.remove();
            }, 500);
        };
        tempImg.src = next;
    }
});


// --------------------------------------------------------
// Setup href links for desktop icons
// --------------------------------------------------------


function initHrefApps() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', (e) => {
            const appId = icon.dataset.app;
            const href = icon.dataset.href;
            if (appId) {
                openWindow(appId);
            } else if (href) {
                window.open(href, '_blank');
            }
        });
    });

    document.querySelectorAll('.desktop-icon[data-href]').forEach(icon => {
        // Add external icon for Href apps
        const extIcon = document.createElement('span');
        extIcon.className = 'desktop-icon-external';
        extIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7 13L13 7M13 7H8M13 7V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="3" width="14" height="14" rx="3" stroke="white" stroke-width="2"/>
        </svg>`;
        
        const span = icon.querySelector('span');
        if (span) {
            const label = document.createElement('span');
            label.className = 'desktop-icon-label';
            const textSpan = span.cloneNode(true);
            textSpan.classList.add('desktop-icon-label-text');
            label.appendChild(textSpan);
            label.appendChild(extIcon);
            span.replaceWith(label);
        } else {
            icon.appendChild(extIcon);
        }
    });
}


// --------------------------------------------------------
// Taskbar handler
// --------------------------------------------------------


const SEARCH_DATA = [
    { type: 'app', id: 'aboutme', label: 'About me', icon: 'assets/icons/aboutme.png' },
    { type: 'app', id: 'journey', label: 'Journey', icon: 'assets/icons/journey.png' },
    { type: 'app', id: 'gallery', label: 'Gallery', icon: 'assets/icons/gallery.png' },
    { type: 'app', id: 'terminal', label: 'Terminal', icon: 'assets/icons/terminal.png' },

    { type: 'shortcut', id: 'github', url: 'https://github.com/leonpupier', label: 'Github', icon: 'assets/icons/github.png' },
    { type: 'shortcut', id: 'linkedin', url: 'https://www.linkedin.com/in/l%C3%A9on-pupier0420/', label: 'Linkedin', icon: 'assets/icons/linkedin.png' },
    { type: 'shortcut', id: 'email', url: 'mailto:public_contact.l2qt6@slmail.me', label: 'Email', icon: 'assets/icons/proton.png' },
    { type: 'shortcut', id: 'kofi', url: 'https://ko-fi.com/leonpupier', label: 'Ko-Fi', icon: 'assets/icons/kofi.png' },
];

const searchInput = document.querySelector('.search-bar input');
const searchResultsBox = document.getElementById('search-results-box');
const left = searchResultsBox.querySelector('.search-results-left');
const right = searchResultsBox.querySelector('.search-results-right');

// Show search results box
searchInput.addEventListener('input', function() {
    const value = searchInput.value.trim().toLowerCase();

    // Search results
    const results = SEARCH_DATA.filter(item => item.label.toLowerCase().includes(value));
    if (results.length) {

        left.innerHTML = results.map(item =>
            `<div class="search-result-item" data-id="${item.id}">
                <img src="${item.icon}" class="search-result-icon" alt="" />
                <span>${item.label}</span>
            </div>`
        ).join('');

        const codeTips = [
            "You can drag and drop desktop icons to rearrange them.",
            "Double-click an icon to open its app.",
            "Press Enter to open all selected desktop icons.",
            "You can resize windows by dragging their borders and corners.",
            "Right-click on the desktop for more options.",
            "You can change the wallpaper from the desktop context menu.",
            "Use the search bar to quickly find apps and shortcuts.",
            "Minimize a window using the taskbar or the window controls.",
            "Explore the terminal for commands!"
        ];

        if (results.length === 1) {
            const item = results[0];
            right.innerHTML = `<div class="search-result-info">
                <b>${item.label}</b><br>
                ${item.type === 'app' ? "LéonOS application" : "External link"}<br>
                ${item.type === 'shortcut' ? `<a href="${item.url}" target="_blank">${item.url}</a>` : ""}
            </div>`;
        } else {
            right.innerHTML = `<div class="search-result-info">
                Click an app or shortcut to open it.<br>
                <span style="opacity:0.7; font-size:0.97em; display:block; margin-top:10px;">
                    Tip:<br>
                    ${codeTips[Math.floor(Math.random() * codeTips.length)]}
                </span>
            </div>`;
        }
        searchResultsBox.style.display = 'block';
        
        // Add click handlers to search result items
        left.querySelectorAll('.search-result-item').forEach(div => {
            div.onclick = (e) => {
                const item = SEARCH_DATA.find(i => i.id === div.dataset.id);
                
                if (item && item.type === 'app') {
                    openWindow(item.id);
                } else if (item && item.type === 'shortcut') {
                    window.open(item.url, '_blank', 'noopener');
                }
                searchResultsBox.style.display = 'none';
                searchInput.value = '';
                e.stopPropagation();

                return false;
            };
        });
    } else {
        left.innerHTML = `<div class="search-result-empty">No result</div>`;
        right.innerHTML = `<div class="search-result-info">Try with another search...</div>`;
        searchResultsBox.style.display = 'block';
    }

    // 424ever easter egg
    if (value === '424ever') {
        right.innerHTML = `
            <div class="search-result-info">
            <h3>And now ..? 👀</h3>
                <pre>T  J</pre>
                <pre>Am G</pre>
            </div>
        `;
    }
});

// Position the search results box above the search input
function positionSearchBox() {
    searchResultsBox.classList.add('visible');
    searchInput.dispatchEvent(new Event('input'));
}

// Hide the search results box when clicking outside
document.addEventListener('click', (e) => {
    if (!searchResultsBox.contains(e.target) && !searchInput.contains(e.target)) {
        searchResultsBox.style.display = 'none';
        searchInput.value = '';
        searchResultsBox.classList.remove('visible');
    }
});

// Position the search box when focused
searchInput.addEventListener('focus', positionSearchBox);


// --------------------------------------------------------
// Check T J Am G
// --------------------------------------------------------


function areMainAppsInSquare() {
    // Gets the desktop icons for the main apps
    const terminal = document.querySelector('.desktop-icon[data-app="terminal"]');
    const journey = document.querySelector('.desktop-icon[data-app="journey"]');
    const aboutme = document.querySelector('.desktop-icon[data-app="aboutme"]');
    const gallery = document.querySelector('.desktop-icon[data-app="gallery"]');
    if (!terminal || !journey || !aboutme || !gallery) return false;

    // Get the positions of the icons
    const t = { left: parseInt(terminal.style.left, 10), top: parseInt(terminal.style.top, 10) };
    const j = { left: parseInt(journey.style.left, 10), top: parseInt(journey.style.top, 10) };
    const am = { left: parseInt(aboutme.style.left, 10), top: parseInt(aboutme.style.top, 10) };
    const g = { left: parseInt(gallery.style.left, 10), top: parseInt(gallery.style.top, 10) };

    // Find min/max for left and top
    const minLeft = Math.min(t.left, j.left, am.left, g.left);
    const maxLeft = Math.max(t.left, j.left, am.left, g.left);
    const minTop = Math.min(t.top, j.top, am.top, g.top);
    const maxTop = Math.max(t.top, j.top, am.top, g.top);

    // Grid tolerance
    const tol = Math.max(GRID_WIDTH, GRID_HEIGHT, GRID_GAP) / 2;

    // Check each app is at the correct corner
    const isTerminalTopLeft    = Math.abs(t.left - minLeft) < tol && Math.abs(t.top - minTop) < tol;
    const isJourneyTopRight    = Math.abs(j.left - maxLeft) < tol && Math.abs(j.top - minTop) < tol;
    const isAboutmeBottomLeft  = Math.abs(am.left - minLeft) < tol && Math.abs(am.top - maxTop) < tol;
    const isGalleryBottomRight = Math.abs(g.left - maxLeft) < tol && Math.abs(g.top - maxTop) < tol;

    // Check it's the valid square formation
    const dx = maxLeft - minLeft;
    const dy = maxTop - minTop;
    const isSquare = Math.abs(dx - dy) < tol && dx > 0 && dy > 0;

    return isTerminalTopLeft && isJourneyTopRight && isAboutmeBottomLeft && isGalleryBottomRight && isSquare;
}


// --------------------------------------------------------
// Easter egg
// --------------------------------------------------------


let easter_egg_found = false;

function launchConfetti() {
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#fff', '#f72585', '#b5179e', '#7209b7', '#3a86ff'];
    const confettiCount = 220;
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.left = 0;
    confettiContainer.style.top = 0;
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = 99999;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 8 + 8;
        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size * 0.4}px`;
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-${size * 2}px`;
        confetti.style.opacity = 0.85;
        confetti.style.borderRadius = `${Math.random() * 50}%`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.transition = 'transform 0.3s';

        // Animation
        const fall = confetti.animate([
            { transform: `translateY(0) rotate(${Math.random() * 360}deg)` },
            { transform: `translateY(${window.innerHeight + 60}px) rotate(${Math.random() * 360}deg)` }
        ], {
            duration: 3200 + Math.random() * 1800,
            delay: Math.random() * 600,
            easing: 'cubic-bezier(.23,1.02,.67,.98)',
            fill: 'forwards'
        });

        fall.onfinish = () => confetti.remove();

        confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove the container after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 5600);
}


function easter_egg() {
    if (easter_egg_found) return;
    launchConfetti();
    pushNotification("Victory! It's useless, but you'll have discovered a few LeonOS functions.", "Easter egg", "party");
    easter_egg_found = true;
}


// --------------------------------------------------------
// Preload images
// --------------------------------------------------------


function preloadImages(onComplete) {
    const images = [
        // About me
        "assets/aboutme/timeline.svg",

        // Gallery
        "assets/gallery/42lyon.jpg",
        "assets/gallery/home.jpg",
        "assets/gallery/klbarmes.jpg",
        "assets/gallery/leon1.jpg",
        "assets/gallery/lyon.jpg",
        "assets/gallery/moto_field.jpg",
        "assets/gallery/moto_helmet.jpg",
        "assets/gallery/moto_ktm.jpg",
        "assets/gallery/slovenie.jpg",
        "assets/gallery/suisse.jpg",
        "assets/gallery/venise.jpg",

        // Icons
        "assets/icons/aboutme.png",
        "assets/icons/contact.png",
        "assets/icons/credits.png",
        "assets/icons/default.png",
        "assets/icons/gallery.png",
        "assets/icons/github.png",
        "assets/icons/info.png",
        "assets/icons/journey.png",
        "assets/icons/kofi.png",
        "assets/icons/left.png",
        "assets/icons/linkedin.png",
        "assets/icons/motivation.png",
        "assets/icons/notification.png",
        "assets/icons/os.png",
        "assets/icons/proton.png",
        "assets/icons/right.png",
        "assets/icons/search.png",
        "assets/icons/shortcut.png",
        "assets/icons/terminal.png",
        "assets/icons/warning.png",
        "assets/icons/weather.png",
        "assets/icons/web.png",
        "assets/icons/welcome.png",

        // Wallpapers
        "assets/wallpapers/1.jpg",
        "assets/wallpapers/2.jpg",
        "assets/wallpapers/3.jpg",
        "assets/wallpapers/4.jpg",
    ];
    
    let loaded = 0;
    if (images.length === 0) {
        onComplete();
        return;
    }

    images.forEach(src => {
        const img = new Image();
        img.onload = img.onerror = () => {
            loaded++;
            if (loaded === images.length) onComplete();
        };
        img.src = src;
    });
}


// --------------------------------------------------------
// DOMContentLoaded
// --------------------------------------------------------


document.addEventListener('DOMContentLoaded', () => {
    preloadImages(() => {
        // Hide the loading overlay
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.style.display = 'none';

            // Wallpaper
            const wallpaper = document.querySelector('.wallpaper');
            if (wallpaper) {
                wallpaper.classList.remove('animated');
                void wallpaper.offsetWidth;
                wallpaper.classList.add('animated');
            }

            // Taskbar
            const taskbar = document.getElementById('taskbar');
            if (taskbar) {
                taskbar.classList.remove('animated');
                void taskbar.offsetWidth;
                taskbar.classList.add('animated');
            }

            // Desktop icons
            const allIcons = Array.from(document.querySelectorAll('.desktop-icon'));
            allIcons.forEach((icon, i) => {
                icon.classList.remove('animated');
                void icon.offsetWidth;
                setTimeout(() => {
                    icon.classList.add('animated');
                }, i * 50);
            });

            // Taskbar elements
            const taskbarGroups = [
                ...document.querySelectorAll('.taskbar-left > *'),
                ...document.querySelectorAll('.taskbar-center > *'),
                ...document.querySelectorAll('.taskbar-right > *')
            ];
            taskbarGroups.forEach((el, i) => {
                el.classList.remove('animated');
                void el.offsetWidth;
                setTimeout(() => {
                    el.classList.add('animated');
                }, i * 80);
            });

        }, 500);

        // Disable the default context menu
        desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Initialize the taskbar
        setInterval(updateTaskbarInfo, 5000);
        updateTaskbarInfo();

        // Initialize the desktop icons & notifications
        document.querySelectorAll('.window').forEach(win => initWindow(win));
        initHrefApps();
        initNotifications();

        // Clock
        updateClock();
        setInterval(updateClock, 1000);
        
        // Welcome notifications
        setTimeout(() => {
            pushNotification("Welcome on LéonOS 👋", "Léon", "welcome");
        }, 3000);
        setTimeout(() => {
            pushNotification("Have fun exploring the system and its features! 👍", "Léon", "welcome");
        }, 5000);
    });
});
