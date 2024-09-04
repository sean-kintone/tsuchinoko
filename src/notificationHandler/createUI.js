import { createSidePanel } from './sidePanel.js';
import { createNotificationElement } from './notification.js';

let uiInitialized = false;

export function initializeUI(notifications, senders) {
    if (uiInitialized) return;

    const notificationContainer = document.querySelector('.ocean-ntf-ntflist-content');
    if (!notificationContainer) return;

    notificationContainer.innerHTML = '';
    notificationContainer.style.cssText = `
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
    `;

    const sidePanel = createSidePanel();
    const notificationList = createNotificationList();

    notificationContainer.appendChild(sidePanel);
    notificationContainer.appendChild(notificationList);

    uiInitialized = true;
    updateUI(notifications, senders);
}

function createNotificationList() {
    const notificationList = document.createElement('div');
    notificationList.className = 'notification-list';
    notificationList.style.cssText = `
        flex-grow: 1;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
    `;

    return notificationList;
}

export function updateUI(notifications, senders) {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;

    notificationList.innerHTML = '';
    notifications.forEach(notification => {
        const notificationElement = createNotificationElement(notification, senders[notification.sender]);
        notificationList.appendChild(notificationElement);
    });
}