import { debounce } from 'lodash-es';

let currentState = new Map();

export async function fetchNotifications(size = 5) {
    try {
        const response = await fetch('/k/api/ntf/list.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                readType: 'ALL',
                mentioned: true,
                checkIgnoreMention: false,
                size: size
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('Received notification data:', data.result);
            return {
                notifications: data.result.ntf,
                senders: data.result.senders
            };
        } else {
            console.error('Failed to fetch notifications:', data);
            return { notifications: [], senders: {} };
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], senders: {} };
    }
}

export function updateCurrentState(notifications) {
    currentState.clear();
    notifications.forEach(notification => {
        currentState.set(notification.id, {
            isRead: notification.read,
            isImportant: notification.flagged
        });
    });
}

export function getCurrentState() {
    return currentState;
}

export const debouncedFetchNotifications = debounce(fetchNotifications, 1000);