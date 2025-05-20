export function initWindows() {
    document.querySelectorAll('.window').forEach(win => {
        // Drag
        const titleBar = win.querySelector('.title-bar');
        let isDragging = false, offsetX = 0, offsetY = 0;

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
        const resizeHandle = win.querySelector('.resize-handle');
        let isResizing = false, startX, startY, startWidth, startHeight;

        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                document.body.style.userSelect = "none";
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                let newWidth = startWidth + (e.clientX - startX);
                let newHeight = startHeight + (e.clientY - startY);
                newWidth = Math.max(250, newWidth);
                newHeight = Math.max(120, newHeight);
                win.style.width = newWidth + 'px';
                win.style.height = newHeight + 'px';
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                document.body.style.userSelect = "";
            });
        }

        // Focus
        win.addEventListener('mousedown', () => {
            bringWindowToFront(win);
        });
    });
}

export function bringWindowToFront(win) {
    let maxZ = 10;
    document.querySelectorAll('.window').forEach(w => {
        const z = parseInt(w.style.zIndex) || 10;
        if (z > maxZ) maxZ = z;
    });
    win.style.zIndex = maxZ + 1;

    // Active l'icône correspondante dans la taskbar
    if (window.setTaskbarActiveIcon) {
        const id = win.id.replace('-window', '');
        window.setTaskbarActiveIcon(id);
    }
}
