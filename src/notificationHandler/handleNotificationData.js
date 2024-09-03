export function getNotificationElements() {
    const notificationElements = document.querySelectorAll('.ocean-ntf-ntfitem');
    console.log(`Found ${notificationElements.length} notification elements`);
    return Array.from(notificationElements);
}

export function extractNotificationInfo(element) {
    const subject = element.querySelector('.ocean-ntf-ntfitem-subject')?.textContent;
    const space = element.querySelector('.ocean-ntf-ntfitem-space')?.textContent;
    const detail = element.querySelector('.ocean-ntf-ntfitem-detail span')?.textContent;
    const date = element.querySelector('.ocean-ntf-ntfitem-date')?.textContent;
    const user = element.querySelector('.ocean-ntf-ntfitem-user')?.textContent;
    const isRead = element.classList.contains('ocean-ntf-ntfitem-read');
    const isImportant = element.classList.contains('ocean-ntf-ntfitem-flagged');

    return { subject, space, detail, date, user, isRead, isImportant };
}

export function processNotifications() {
    const notifications = getNotificationElements();
    notifications.forEach((notification, index) => {
        const info = extractNotificationInfo(notification);
        console.log(`Notification ${index + 1}:`, info);
    });
}

let currentState = new Map();

export function updateCurrentState() {
    const notifications = getNotificationElements();
    currentState.clear();
    notifications.forEach(notification => {
        const id = notification.id;
        const { isRead, isImportant } = extractNotificationInfo(notification);
        currentState.set(id, { isRead, isImportant });
    });
}

export function getCurrentState() {
    return currentState;
}