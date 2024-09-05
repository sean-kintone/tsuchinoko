import { fetchNotifications, updateCurrentState, debouncedFetchNotifications } from './handleNotificationData.js';
import { initializeUI, updateUI } from './createUI.js';

if (window.location.href.includes('/k/#/ntf/mention')) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "helloWorld") {
            console.log("Hello World from content script!");
            sendResponse({ success: true });
            return true;
        }
    });

    async function initializeNotifications() {
        try {
            const { notifications, senders } = await fetchNotifications();
            if (notifications && senders) {
                updateCurrentState(notifications);
                initializeUI(notifications, senders);
            } else {
                console.error('Failed to fetch notifications or senders');
            }
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
        }
    }

    // Initial processing and state update
    initializeNotifications();

    // Update notifications periodically
    setInterval(async () => {
        try {
            const { notifications, senders } = await debouncedFetchNotifications();
            if (notifications && senders) {
                updateCurrentState(notifications);
                updateUI(notifications, senders);
            } else {
                console.error('Failed to fetch notifications or senders during update');
            }
        } catch (error) {
            console.error('Failed to update notifications:', error);
        }
    }, 30000); // Check every 30 seconds

    // Observe for changes in the URL
    let lastUrl = location.href; 
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (url.includes('/k/#/ntf/mention')) {
                initializeNotifications();
            }
        }
    }).observe(document, {subtree: true, childList: true});
}