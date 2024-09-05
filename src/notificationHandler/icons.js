import { handleCloseIconClick } from './notification.js';

const iconColor = '#999'; // grey color for inactive state
const iconHoverColor = '#333'; // darker color for hover state
const iconSize = '24';

function createIcon(path, name) {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon ${name}-icon" style="cursor: pointer; transition: stroke 0.3s ease;">
            ${path}
        </svg>
    `;
}

const icons = {
    close: createIcon('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>', 'close'),
    snooze: createIcon('<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', 'snooze'),
    swoosh: createIcon('<path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>', 'swoosh'),
    flag: createIcon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>', 'flag')
};

export function createIcons() {
    return Object.values(icons).join('');
}

export function addIconEventListeners(element, notification) {
    element.querySelectorAll('.icon-group .icon').forEach(icon => {
        addIconHoverEffect(icon);
    });

    element.querySelector('.close-icon').addEventListener('click', (e) => handleCloseIconClick(e, notification));
    addIconClickListener(element, '.snooze-icon', 'Snooze icon clicked');
    element.querySelector('.swoosh-icon').addEventListener('click', (e) => handleSwooshIconClick(e, notification, element));
    addIconClickListener(element, '.flag-icon', 'Flag icon clicked');
}

function addIconHoverEffect(icon) {
    icon.addEventListener('mouseenter', () => {
        icon.style.stroke = iconHoverColor;
    });
    icon.addEventListener('mouseleave', () => {
        icon.style.stroke = iconColor;
    });
}

function addIconClickListener(element, selector, logMessage) {
    element.querySelector(selector).addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(logMessage);
        // Add specific functionality here
    });
}

async function handleSwooshIconClick(event, notification, element) {
    event.stopPropagation();
    console.log('Swoosh icon clicked for notification:', notification.id);

    // Find the input fields using the notification ID
    const metadataInput = element.querySelector(`.metadata-input[data-notification-id="${notification.id}"]`);
    const inputFieldMetadata = metadataInput ? metadataInput.value : '';
    
    const dueDateTimeInput = element.querySelector(`.due-datetime-input[data-notification-id="${notification.id}"]`);
    const dueDateTimeValue = dueDateTimeInput ? dueDateTimeInput.value : '';

    // Format the datetime for Kintone
    const formattedDateTime = dueDateTimeValue ? new Date(dueDateTimeValue).toISOString() : notification.sentTime;
    
    const body = {
        app: 16, // Hardcoded app ID
        record: {
            baseId: { value: notification.id },
            groupKey: { value: notification.groupKey },
            requester: { value: [{ code: notification.sender }] },
            request_date: { value: notification.sentTime },
            priority: { value: "normal" }, // Hardcoded as we don't have this info
            due_date: { value: formattedDateTime },
            in_charge: { value: [{ code: "uchida" }] }, // Hardcoded as we don't have this info
            task_content: { value: notification.content.message.text },
            task_memo: { value: inputFieldMetadata }
        }
    };

    console.log('Sending request body:', JSON.stringify(body, null, 2));

    try {
        const response = await fetch('/k/v1/record.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Notification posted to Kintone:', data);
        
        // You might want to update the UI here to indicate success
        alert('Notification posted to Kintone successfully!');
    } catch (error) {
        console.error('Error posting notification to Kintone:', error);
        alert('Failed to post notification to Kintone. Please try again.');
    }
}