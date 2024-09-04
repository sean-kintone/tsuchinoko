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

function createSidePanel() {
    const sidePanel = document.createElement('div');
    sidePanel.className = 'notification-side-panel';
    sidePanel.style.cssText = `
        width: 250px;
        height: 100vh;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
        padding: 20px;
        box-sizing: border-box;
    `;

    sidePanel.innerHTML = `
        <h2>Notifications</h2>
        <ul>
            <li>All Notifications</li>
            <li>Unread</li>
            <li>Flagged</li>
        </ul>
    `;

    return sidePanel;
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

function createNotificationElement(notification, sender) {
    const element = document.createElement('div');
    element.className = 'notification-item';
    element.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        background-color: ${notification.read ? '#ffffff' : '#f0f8ff'};
        cursor: pointer;
        transition: background-color 0.3s ease;
    `;

    // Add hover effect
    element.addEventListener('mouseenter', () => {
        element.style.backgroundColor = '#e6e6e6';
    });
    element.addEventListener('mouseleave', () => {
        element.style.backgroundColor = notification.read ? '#ffffff' : '#f0f8ff';
    });

    // Make notification clickable
    element.addEventListener('click', () => {
        if (notification.url) {
            window.location.href = notification.url;
        }
    });

    const content = notification.content;
    const title = content.title.text;
    const subTitle = content.subTitle.text;
    const message = content.message.text;
    const sentTime = new Date(notification.sentTime).toLocaleString();
    const senderName = sender ? sender.name : 'Unknown Sender';

    element.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <img src="${content.icon}" alt="Notification Icon" style="width: 24px; height: 24px; margin-right: 10px;">
            <div>
                <span style="font-weight: bold; margin-right: 10px;">${title}</span>
                <span>${subTitle}</span>
            </div>
        </div>
        <p>${message}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${sentTime}</span>
            <span>${senderName}</span>
        </div>
        <div style="margin-top: 5px;">
            ${notification.flagged ? '<span style="margin-right: 5px;">🚩</span>' : ''}
            ${notification.mention ? '<span>@</span>' : ''}
        </div>
    `;

    return element;
}