let notificationCount = 0;
let notificationHistory = [];

function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    if (notificationCount > 0) {
        badge.textContent = notificationCount;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotificationHistory() {
    const list = document.getElementById('notification-history-list');
    if (!list) return;
    list.innerHTML = '';
    notificationHistory.slice().reverse().forEach(obj => {
        const div = document.createElement('div');
        div.className = 'notification-history-item';

        // Icon
        const icon = document.createElement('img');
        icon.className = 'notification-history-img';
        icon.src = obj.icon || "assets/icons/default.png";
        icon.alt = obj.appName || "App";

        // Content (title + message)
        const content = document.createElement('div');
        content.className = 'notification-history-content';

        const title = document.createElement('div');
        title.className = 'notification-history-title';
        title.textContent = obj.appName || "Notification";

        const msgSpan = document.createElement('div');
        msgSpan.className = 'notification-history-message';
        msgSpan.textContent = obj.message;

        // Time
        const date = obj.time instanceof Date ? obj.time : new Date(obj.time);
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        const timeSpan = document.createElement('span');
        timeSpan.style.fontSize = '13px';
        timeSpan.style.color = '#0078d4';
        timeSpan.style.marginLeft = '8px';
        timeSpan.textContent = `${h}:${m}`;

        content.appendChild(title);
        content.appendChild(msgSpan);

        div.appendChild(icon);
        div.appendChild(content);
        div.appendChild(timeSpan);

        list.appendChild(div);
    });
}

export function pushNotification(message, appName = "", icon = "", duration = 4000) {
    // Icon source
    let iconSrc = "assets/icons/notification.png";
    if (icon) {
        const testImg = new Image();
        testImg.src = `assets/icons/${icon}.png`;
        testImg.onload = () => {};
        testImg.onerror = () => { iconSrc = "assets/icons/notification.png"; };
        iconSrc = `assets/icons/${icon}.png`;
    }

    // Add the notification to the history
    notificationHistory.push({
        message,
        time: new Date(),
        appName,
        icon: iconSrc
    });
    renderNotificationHistory();

    const panel = document.getElementById('notification-history-panel');
    const isPanelOpen = panel && panel.classList.contains('visible');

    // If the panel is open, don't show the toast
    if (isPanelOpen) {
        return;
    }

    // Else, show the toast
    const container = document.getElementById('notification-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <img class="notification-toast-img" src="${iconSrc}" alt="${appName}">
        <div>
            <div class="notification-toast-title">${appName ? appName : "Notification"}</div>
            <div>${message}</div>
        </div>
    `;

    container.appendChild(toast);

    notificationCount++;
    updateNotificationBadge();

    // Remove the toast
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

export function initNotifications() {
    updateNotificationBadge();

    const notifIcon = document.getElementById('notification-icon');
    const panel = document.getElementById('notification-history-panel');
    const closeBtn = document.getElementById('close-notification-history');

     if (notifIcon && panel) {
        notifIcon.onclick = (e) => {
            panel.classList.add('visible');
            notificationCount = 0;
            updateNotificationBadge();
            
            // Remove all toasts notifications
            document.querySelectorAll('.notification-toast').forEach(toast => {
                toast.classList.add('hide');
                toast.addEventListener('animationend', () => {
                    toast.remove();
                }, { once: true });
            });
            e.stopPropagation();
        };
    }
    if (closeBtn && panel) {
        closeBtn.onclick = (e) => {
            panel.classList.remove('visible');
            e.stopPropagation();
        };
    }

    // Close panel
    document.addEventListener('mousedown', function(e) {
        if (!panel.classList.contains('visible')) return;
        if (
            !panel.contains(e.target) &&
            e.target !== notifIcon &&
            !notifIcon.contains(e.target)
        ) {
            panel.classList.remove('visible');
        }
    });

    renderNotificationHistory();
}