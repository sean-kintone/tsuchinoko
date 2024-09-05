import { fetchNotifications, updateCurrentState } from './handleNotificationData.js';
import { fetchTasks, convertTasksToNotifications } from '../taskHandler/handleTaskData.js';
import { createSidePanel } from './sidePanel.js';
import { createNotificationElement } from './notification.js';

let uiInitialized = false;

export async function initializeUI() {
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

    // Fetch notifications and tasks
    const [{ notifications, senders }, tasks] = await Promise.all([
        fetchNotifications(),
        fetchTasks()
    ]);

    // Convert tasks to notification format
    const taskNotifications = convertTasksToNotifications(tasks);

    // Combine notifications and tasks
    const allNotifications = [...notifications, ...taskNotifications];

    updateCurrentState(allNotifications);
    updateUI(allNotifications, senders);
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
        if (notificationElement) {
            notificationList.appendChild(notificationElement);
        }
    });
}