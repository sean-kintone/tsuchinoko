export let isModifying = false;
let sideBarAdded = false;

function createSidePanel() {
    if (document.querySelector('.notification-side-panel')) return null;
    
    const sidePanel = document.createElement('div');
    sidePanel.className = 'notification-side-panel';
    sidePanel.style.cssText = `
        position: relative;
        float: left;
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

export function modifyNotifications() {
    if (isModifying) return;
    isModifying = true;

    const notificationContainer = document.querySelector('.ocean-ntf-ntflist-content');
    if (!notificationContainer) {
        isModifying = false;
        return;
    }

    if (!sideBarAdded) {
        const sidePanel = createSidePanel();
        if (sidePanel) {
            notificationContainer.insertBefore(sidePanel, notificationContainer.firstChild);
            sideBarAdded = true;
        }
    }

    notificationContainer.style.cssText = `
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
    `;

    let notificationList = notificationContainer.querySelector('.notification-list');
    if (!notificationList) {
        notificationList = document.createElement('div');
        notificationList.className = 'notification-list';
        notificationList.style.cssText = `
            flex-grow: 1;
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
        `;
        notificationContainer.appendChild(notificationList);
    }

    const notifications = document.querySelectorAll('.ocean-ntf-ntfitem:not(.modified-notification)');
    notifications.forEach(notification => {
        modifySingleNotification(notification);
        notificationList.appendChild(notification);
    });

    isModifying = false;
}

function modifySingleNotification(notification) {
    notification.classList.add('modified-notification');

    notification.style.cssText = `
        position: relative;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: 15px;
        margin-bottom: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #ffffff;
        min-height: 150px; /* Adjust as needed */
    `;

    const contentIconContainer = document.createElement('div');
    contentIconContainer.className = 'content-icon-container';
    contentIconContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; width: 100%; flex-grow: 1;';

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.style.cssText = 'flex-grow: 1; margin-right: 20px;';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    iconContainer.style.cssText = `
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    `;

    ['subject', 'space', 'detail'].forEach(className => {
        const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
        if (element) {
            element.style.cssText = `margin-bottom: 5px; ${className === 'subject' ? 'font-weight: bold;' : ''}`;
            mainContent.appendChild(element);
        }
    });

    ['flag', 'mark'].forEach(className => {
        const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
        if (element) {
            element.style.cssText = `
                margin-bottom: 10px;
                cursor: pointer;
                opacity: 1 !important;
                visibility: visible !important;
                display: block;
            `;
            element.onmouseenter = null;
            element.onmouseleave = null;
            iconContainer.appendChild(element);
        }
    });

    contentIconContainer.appendChild(mainContent);
    contentIconContainer.appendChild(iconContainer);

    const metaContainer = document.createElement('div');
    metaContainer.className = 'notification-meta';
    metaContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 10px;
        width: 100%;
    `;

    ['date', 'user'].forEach(className => {
        const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
        if (element) {
            element.style.cssText = `${className === 'date' ? 'margin-right: 10px;' : ''}`;
            metaContainer.appendChild(element);
        }
    });

    notification.innerHTML = '';
    notification.appendChild(contentIconContainer);
    notification.appendChild(metaContainer);
}

export function updateNotifications() {
    const notificationContainer = document.querySelector('.ocean-ntf-ntflist-content');
    if (!notificationContainer) return;

    const notificationList = notificationContainer.querySelector('.notification-list');
    if (!notificationList) return;

    const notifications = notificationContainer.querySelectorAll('.ocean-ntf-ntfitem');
    notifications.forEach(notification => {
        notification.classList.remove('modified-notification');
        modifySingleNotification(notification);
        notificationList.appendChild(notification);
    });
}

// Debounce function to limit the rate of function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of updateNotifications
const debouncedUpdateNotifications = debounce(updateNotifications, 250);

// Add event listener for window resize
window.addEventListener('resize', debouncedUpdateNotifications);