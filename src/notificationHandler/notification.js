import { createIcons, addIconEventListeners } from './icons.js';
import { markNotificationAsRead, debouncedRefreshNotifications } from './handleNotificationData.js';

export function createNotificationElement(notification, sender) {
    if (notification.read) {
        console.log('Skipping read notification:', notification.id);
        return null;
    }

    console.log('Creating notification element:', notification);
    const element = document.createElement('div');
    element.className = 'notification-item';
    element.dataset.notificationId = notification.id;

    const baseColor = getBackgroundColor(notification.priority, notification.isTask);
    const hoverColor = getHoverBackgroundColor(baseColor);

    element.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        background-color: ${baseColor};
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: stretch;
    `;

    addHoverEffect(element, baseColor, hoverColor);
    addNotificationClickHandler(element, notification);

    const content = notification.content;
    const title = content.title.text;
    const subTitle = notification.moduleType === 'APP' ? content.subTitle.text : '';
    const message = content.message.text;
    const sentTime = new Date(notification.sentTime).toLocaleString();

    let iconHtml = '';
    const priorityValue = getPriorityValue(notification.priority);
    
    if (priorityValue === 'urgent') {
        iconHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <path d="M12 2L12 12"></path>
                <path d="M12 16L12.01 16"></path>
            </svg>
        `;
    } else if (notification.moduleType === 'APP') {
        iconHtml = `<img src="${content.icon}" alt="Notification Icon" style="width: 48px; height: 48px; margin-right: 10px;">`;
    } else if (notification.moduleType === 'PEOPLE') {
        iconHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    }
    let memoAndDateHtml = '';
    if (notification.isTask) {
        memoAndDateHtml = `
            <div style="font-size: 0.9em; color: #333; margin-top: 5px;">
                ${notification.taskMemo ? `<p>メモ: ${notification.taskMemo}</p>` : ''}
                ${notification.dueDate ? `<p>期限: ${new Date(notification.dueDate).toLocaleString()}</p>` : ''}
            </div>
        `;
    } else {
        memoAndDateHtml = `
            <input type="text" class="metadata-input" data-notification-id="${notification.id}" placeholder="メモ" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 5px;">
            <input type="datetime-local" class="due-datetime-input" data-notification-id="${notification.id}" style="width: 100%; padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
        `;
    }
    element.innerHTML = `
        <div style="flex: 2; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                ${iconHtml}
                <div>
                    <span style="font-weight: bold; margin-right: 10px;">${title}</span>
                    <span>${subTitle}</span>
                </div>
            </div>
            <p style="margin: 0;">${message}</p>
            <div style="font-size: 0.8em; color: #666; margin-top: 5px;">
                ${sentTime}
            </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; padding: 0 10px;">
            ${memoAndDateHtml}
        </div>
        <div class="icon-group" style="flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
            ${createIcons(notification.isTask)}
        </div>
    `;
    addIconEventListeners(element, notification);
    if (!notification.isTask) {
        addMetadataInputHandler(element);
        addDateTimeInputHandler(element);
    }
    return element;
}

function addMetadataInputHandler(element) {
    const input = element.querySelector('.metadata-input');
    input.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });
}

function addNotificationClickHandler(element, notification) {
    const constructedUrl = constructNotificationUrl(notification);
    element.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-group') && !e.target.closest('.metadata-input') && constructedUrl) {
            window.location.href = constructedUrl;
        }
    });
}

function addDateTimeInputHandler(element) {
    const input = element.querySelector('.due-datetime-input');
    input.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });
}

function addHoverEffect(element, baseColor, hoverColor) {
    element.addEventListener('mouseenter', () => {
        element.style.backgroundColor = hoverColor;
    });
    element.addEventListener('mouseleave', () => {
        element.style.backgroundColor = baseColor;
    });
}

function constructNotificationUrl(notification) {
    const baseUrl = window.location.origin;
    let url = `${baseUrl}/k/#/ntf/mention`;
    if (notification.moduleType === "APP") {
        url += `/k/a:${notification.moduleId}:${notification.moduleSubId}:/${notification.id}`;
    } else if (notification.moduleType === "PEOPLE") {
        url = `${baseUrl}${notification.url}`;
    } else {
        console.warn('Unhandled module type:', notification.moduleType);
        return null;
    }
    return url;
}

export async function handleCloseIconClick(event, notification) {
    event.stopPropagation();
    const success = await markNotificationAsRead(notification);
    if (success) {
        debouncedRefreshNotifications();
    } else {
        console.error('Failed to mark notification as read');
    }
}

function getBackgroundColor(priority, isTask) {
    const priorityValue = getPriorityValue(priority);
    
    if (priorityValue === 'urgent') {
        return '#f78da4'; // Reddish
    } else if (priorityValue === 'high') {
        return '#ffa500'; // Orangish
    } else {
        if (isTask) {
            return '#faf3c0'; // yellow for tasks
        } else {
            return '#f0f8ff'; // light blue for notifications
        }
    }
}

function getPriorityValue(priority) {
    if (priority) {
        if (typeof priority === 'object' && priority.value) {
            return priority.value.toLowerCase();
        } else if (typeof priority === 'string') {
            return priority.toLowerCase();
        }
    }
    return 'normal';
}

function getHoverBackgroundColor(baseColor) {
    // Darken the base color for hover effect
    return baseColor === '#f0f8ff' ? '#e6e6e6' : LightenDarkenColor(baseColor, -20);
}

// Helper function to lighten or darken a color
function LightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}