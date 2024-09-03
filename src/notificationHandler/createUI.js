export let isModifying = false;
let sideBarAdded = false;

function createSidePanel() {
    if (document.querySelector('.notification-side-panel')) return null;
    
    const sidePanel = document.createElement('div');
    sidePanel.className = 'notification-side-panel';
    sidePanel.style.cssText = `
        position: relative;
        left: 0;
        top: 0;
        bottom: 0;
        width: 250px;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
        padding: 20px;
        overflow-y: auto;
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
    if (notificationContainer && !sideBarAdded) {
        const wrapper = document.createElement('div');
        wrapper.className = 'notification-wrapper';
        wrapper.style.cssText = `
            display: flex;
            width: 100%;
            height: 100vh;
        `;

        const sidePanel = createSidePanel();
        if (sidePanel) {
            wrapper.appendChild(sidePanel);
            sideBarAdded = true;
        }

        notificationContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            width: calc(100% - 250px);
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
            height: auto !important;
        `;

        notificationContainer.parentNode.insertBefore(wrapper, notificationContainer);
        wrapper.appendChild(notificationContainer);
    }

    const notifications = document.querySelectorAll('.ocean-ntf-ntfitem:not(.modified-notification)');
    notifications.forEach(notification => {
        notification.classList.add('modified-notification');

        notification.style.cssText = `
            position: static;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #ffffff;
        `;

        const contentIconContainer = document.createElement('div');
        contentIconContainer.className = 'content-icon-container';
        contentIconContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; position: static;';

        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        mainContent.style.cssText = 'flex-grow: 1; position: static;';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        iconContainer.style.cssText = 'display: flex; align-items: center; position: static;';

        ['subject', 'space', 'detail'].forEach(className => {
            const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
            if (element) {
                element.style.cssText = `margin-bottom: 5px; ${className === 'subject' ? 'font-weight: bold;' : ''} position: static;`;
                mainContent.appendChild(element);
            }
        });

        ['flag', 'mark'].forEach(className => {
            const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
            if (element) {
                element.style.cssText = 'width: 24px; height: 24px; margin-right: 5px; cursor: pointer; position: static;';
                iconContainer.appendChild(element);
            }
        });

        contentIconContainer.appendChild(mainContent);
        contentIconContainer.appendChild(iconContainer);

        const metaContainer = document.createElement('div');
        metaContainer.className = 'notification-meta';
        metaContainer.style.cssText = 'display: flex; justify-content: flex-start; align-items: center; margin-top: 5px; position: static;';

        ['date', 'user'].forEach(className => {
            const element = notification.querySelector(`.ocean-ntf-ntfitem-${className}`);
            if (element) {
                element.style.cssText = `${className === 'date' ? 'margin-right: 10px;' : ''} position: static;`;
                metaContainer.appendChild(element);
            }
        });

        notification.innerHTML = '';
        notification.appendChild(contentIconContainer);
        notification.appendChild(metaContainer);

        Array.from(notification.querySelectorAll('*')).forEach(child => {
            if (getComputedStyle(child).position === 'absolute') {
                child.style.position = 'static';
            }
        });
    });

    isModifying = false;
}

export function updateNotifications() {
    modifyNotifications();
}