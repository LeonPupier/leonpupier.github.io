export function initWindow(win) {
    if (!win) return;
    // Drag
    const titleBar = win.querySelector('.title-bar');
    if (!titleBar) return;

    let isDragging = false, offsetX = 0, offsetY = 0;
    addResizeHandles(win);

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        bringWindowToFront(win);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Resize
    let isResizing = false, resizeDir = "", startX, startY, startWidth, startHeight, startTop, startLeft;

    win.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            resizeDir = Array.from(handle.classList).find(cls => cls.startsWith('resize-handle-')).replace('resize-handle-', '');
            const rect = win.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = rect.width;
            startHeight = rect.height;
            startTop = rect.top;
            startLeft = rect.left;
            document.body.style.userSelect = "none";
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        if (resizeDir === "right") {
            win.style.width = Math.max(250, startWidth + dx) + "px";
        } else if (resizeDir === "left") {
            let newWidth = Math.max(250, startWidth - dx);
            win.style.width = newWidth + "px";
            win.style.left = (startLeft + dx) + "px";
        } else if (resizeDir === "bottom") {
            win.style.height = Math.max(120, startHeight + dy) + "px";
        } else if (resizeDir === "top") {
            let newHeight = Math.max(120, startHeight - dy);
            win.style.height = newHeight + "px";
            win.style.top = (startTop + dy) + "px";
        } else if (resizeDir === "bottom-right") {
            win.style.width = Math.max(250, startWidth + dx) + "px";
            win.style.height = Math.max(120, startHeight + dy) + "px";
        } else if (resizeDir === "bottom-left") {
            let newWidth = Math.max(250, startWidth - dx);
            win.style.width = newWidth + "px";
            win.style.left = (startLeft + dx) + "px";
            win.style.height = Math.max(120, startHeight + dy) + "px";
        } else if (resizeDir === "top-right") {
            win.style.width = Math.max(250, startWidth + dx) + "px";
            let newHeight = Math.max(120, startHeight - dy);
            win.style.height = newHeight + "px";
            win.style.top = (startTop + dy) + "px";
        } else if (resizeDir === "top-left") {
            let newWidth = Math.max(250, startWidth - dx);
            win.style.width = newWidth + "px";
            win.style.left = (startLeft + dx) + "px";
            let newHeight = Math.max(120, startHeight - dy);
            win.style.height = newHeight + "px";
            win.style.top = (startTop + dy) + "px";
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.userSelect = "";
    });

    // Focus
    win.addEventListener('mousedown', () => {
        bringWindowToFront(win);
    });
}

export function addResizeHandles(win) {
    const handles = [
        'right', 'left', 'bottom', 'top',
        'corner', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    ];
    handles.forEach(dir => {
        const div = document.createElement('div');
        div.className = `resize-handle resize-handle-${dir}`;
        win.appendChild(div);
    });
}

export function bringWindowToFront(win) {
    let maxZ = 10;
    document.querySelectorAll('.window').forEach(w => {
        const z = parseInt(w.style.zIndex) || 10;
        if (z > maxZ) maxZ = z;
    });
    win.style.zIndex = maxZ + 1;

    // Activate taskbar icon
    if (window.setTaskbarActiveIcon) {
        const id = win.id.replace('-window', '');
        window.setTaskbarActiveIcon(id);
    }
}
