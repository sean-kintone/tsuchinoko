import { processNotifications, updateCurrentState, getCurrentState, extractNotificationInfo } from './handleNotificationData.js';
import { createOverlay, updateOverlay } from './createUI.js';

if (window.location.href.includes('/k/#/ntf/mention')) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "helloWorld") {
            console.log("Hello World from content script!");
            sendResponse({ success: true });
            return true;
        }
    });

    // Initial processing and state update
    processNotifications();
    updateCurrentState();

    const observer = new MutationObserver((mutations) => {
        let shouldReprocess = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                shouldReprocess = true;
                break;
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('ocean-ntf-ntfitem')) {
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
            processNotifications();
            updateCurrentState();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

// Initial creation of overlay
createOverlay();

// Observe for changes and update overlay if necessary
const uiObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' &&
            (mutation.target.classList.contains('ocean-ntf-ntflist-content') ||
                mutation.target.closest('.ocean-ntf-ntflist-content'))) {
            createOverlay();
            updateOverlay();
            break;
        }
    }
});

uiObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
});

// Update overlay on window resize
window.addEventListener('resize', updateOverlay);