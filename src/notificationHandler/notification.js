import { createIcons, addIconEventListeners } from './icons.js';

export function createNotificationElement(notification, sender) {
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

    addNotificationHoverEffect(element, notification.read);
    addNotificationClickHandler(element, notification);

    const content = notification.content;
    const title = content.title.text;
    const subTitle = content.subTitle.text;
    const message = content.message.text;
    const sentTime = new Date(notification.sentTime).toLocaleString();

    element.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <img src="${content.icon}" alt="Notification Icon" style="width: 64px; height: 64px; margin-right: 10px;">
            <div>
                <span style="font-weight: bold; margin-right: 10px;">${title}</span>
                <span>${subTitle}</span>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <p style="margin: 0; width: 65%;">${message}</p>
            <div class="icon-group" style="display: flex; justify-content: flex-end; width: 35%; gap: 10px;">
                ${createIcons()}
            </div>
        </div>
        <div style="text-align: right; font-size: 0.8em; color: #666; margin-top: 10px;">
            ${sentTime}
        </div>
    `;

    addIconEventListeners(element);

    return element;
}

function addNotificationHoverEffect(element, isRead) {
    element.addEventListener('mouseenter', () => {
        element.style.backgroundColor = '#e6e6e6';
    });
    element.addEventListener('mouseleave', () => {
        element.style.backgroundColor = isRead ? '#ffffff' : '#f0f8ff';
    });
}

function addNotificationClickHandler(element, notification) {
    const constructedUrl = constructNotificationUrl(notification);
    element.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-group') && constructedUrl) {
            window.location.href = constructedUrl;
        }
    });
}

function constructNotificationUrl(notification) {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/k/#/ntf/mention`;
    if (notification.moduleType === "APP") {
        url += `/k/a:${notification.moduleId}:${notification.moduleSubId}:/${notification.id}`;
    } else {
        console.warn('Unhandled module type:', notification.moduleType);
        return null;
    }
    return url;
}