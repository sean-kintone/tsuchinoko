import { processNotifications, updateCurrentState, getCurrentState, extractNotificationInfo } from './handleNotificationData.js';
import { modifyNotifications, updateNotifications, isModifying } from './createUI.js';

if (window.location.href.includes('/k/#/ntf/mention')) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "helloWorld") {
            console.log("Hello World from content script!");
            sendResponse({ success: true });
            return true;
        }
    });

    function initializeNotifications() {
        console.log('Initializing notifications...');
        processNotifications();
        updateCurrentState();
        modifyNotifications();
    }

    // Initial processing and state update
    initializeNotifications();

    const observer = new MutationObserver((mutations) => {
        if (isModifying) return;

        let shouldReprocess = false;
        for (const mutation of mutations) {
            if (mutation.target.classList.contains('notification-list')) continue;
            
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const removedNodes = Array.from(mutation.removedNodes);
                if (addedNodes.some(node => node.nodeType === Node.ELEMENT_NODE && 
                    (node.classList.contains('ocean-ntf-ntfitem') || node.querySelector('.ocean-ntf-ntfitem'))) ||
                    removedNodes.some(node => node.nodeType === Node.ELEMENT_NODE && 
                    (node.classList.contains('ocean-ntf-ntfitem') || node.querySelector('.ocean-ntf-ntfitem')))) {
                    shouldReprocess = true;
                    break;
                }
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('ocean-ntf-ntfitem') && !target.classList.contains('modified-notification')) {
                    const id = target.id;
                    const { isRead, isImportant } = extractNotificationInfo(target);
                    const oldState = getCurrentState().get(id);
                    if (!oldState || oldState.isRead !== isRead || oldState.isImportant !== isImportant) {
                        shouldReprocess = true;
                        break;
                    }
                }
            }
        }
        if (shouldReprocess) {
            console.log('Notifications updated, reprocessing...');
            updateNotifications();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });

    // Observe for changes in the URL
    let lastUrl = location.href; 
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (url.includes('/k/#/ntf/mention')) {
                console.log('Notification page loaded, initializing...');
                initializeNotifications();
            }
        }
    }).observe(document, {subtree: true, childList: true});
}

console.log('Content script loaded and running.');