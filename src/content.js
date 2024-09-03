if (window.location.href.includes('/k/#/ntf/mention')) {

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "helloWorld") {
            console.log("Hello World from content script!");
            // Reponse はなぜか正常に受け取れない状態です。要は、受信できるが応答ができない
            sendResponse({ success: true });
            return true;
        }
    });

    function getNotificationElements() {
        const notificationElements = document.querySelectorAll('.ocean-ntf-ntfitem');
        console.log(`Found ${notificationElements.length} notification elements`);
        return Array.from(notificationElements);
    }

    function extractNotificationInfo(element) {
        const subject = element.querySelector('.ocean-ntf-ntfitem-subject')?.textContent;
        const space = element.querySelector('.ocean-ntf-ntfitem-space')?.textContent;
        const detail = element.querySelector('.ocean-ntf-ntfitem-detail span')?.textContent;
        const date = element.querySelector('.ocean-ntf-ntfitem-date')?.textContent;
        const user = element.querySelector('.ocean-ntf-ntfitem-user')?.textContent;
        const isRead = element.classList.contains('ocean-ntf-ntfitem-read');
        const isImportant = element.classList.contains('ocean-ntf-ntfitem-flagged');

        return { subject, space, detail, date, user, isRead, isImportant };
    }

    function processNotifications() {
        const notifications = getNotificationElements();
        notifications.forEach((notification, index) => {
            const info = extractNotificationInfo(notification);
            console.log(`Notification ${index + 1}:`, info);
        });
    }

    // Store the current state of notifications
    let currentState = new Map();

    function updateCurrentState() {
        const notifications = getNotificationElements();
        currentState.clear();
        notifications.forEach(notification => {
            const id = notification.id;
            const { isRead, isImportant } = extractNotificationInfo(notification);
            currentState.set(id, { isRead, isImportant });
        });
    }

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
                    const oldState = currentState.get(id);
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