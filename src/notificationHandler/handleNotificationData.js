import { debounce } from 'lodash-es';
import { updateUI } from './createUI.js';

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

        if (data.success && data.result && Array.isArray(data.result.ntf)) {
            // Add a default priority if it's missing
            data.result.ntf = data.result.ntf.map(notification => ({
                ...notification,
                priority: notification.priority || { value: 'normal' },
                isTask: false
            }));
            return {
                notifications: data.result.ntf,
                senders: data.result.senders || {}
            };
        } else {
            console.error('Failed to fetch notifications or unexpected data structure:', data);
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

let passedData;

export const getCybozuData = async () => {
    if (passedData !== undefined) {
        return passedData;
    }
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            document.body.removeEventListener("pass-cybozu-data", handler);
            reject(new Error("Could not get cybozu.data."));
        }, 1000);
        const handler = async (event) => {
            clearTimeout(timer);
            passedData = event.detail;
            resolve(event.detail);
        };
        document.body.addEventListener("pass-cybozu-data", handler, {
            once: true,
        });
        const scriptEl = document.createElement("script");
        scriptEl.src = chrome.runtime.getURL("pass-cybozu-data.js");
        document.body.appendChild(scriptEl);
    });
};

export async function markNotificationAsRead(notification) {
    try {
        const cybozuData = await getCybozuData();

        const payload = {
            messages: [{
                read: true,
                groupKey: notification.groupKey,
                baseId: notification.id
            }],
            __REQUEST_TOKEN__: cybozuData.requestToken
        };
        const response = await fetch('/k/api/ntf/mark.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            return true;
        } else {
            console.error('Failed to mark notification as read:', data);
            return false;
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
}

export async function refreshNotifications() {
    try {
        const [{ notifications, senders }, tasks] = await Promise.all([
            fetchNotifications(),
            fetchTasks()
        ]);
        const taskNotifications = convertTasksToNotifications(tasks);
        const allNotifications = [...notifications, ...taskNotifications];
        updateCurrentState(allNotifications);
        updateUI(allNotifications, senders);
    } catch (error) {
        console.error('Error refreshing notifications and tasks:', error);
    }
}

export const debouncedRefreshNotifications = debounce(refreshNotifications, 1000);
