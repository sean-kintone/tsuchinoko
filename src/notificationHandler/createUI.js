export let isModifying = false;

export function modifyNotifications() {
    if (isModifying) return;
    isModifying = true;

    const notificationContainer = document.querySelector('.ocean-ntf-ntflist-content');
    if (notificationContainer) {
        notificationContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
        `;
    }

    const notifications = document.querySelectorAll('.ocean-ntf-ntfitem:not(.modified-notification)');
    notifications.forEach(notification => {
        // Mark this notification as modified
        notification.classList.add('modified-notification');

        // Remove position: absolute and adjust layout
        notification.style.cssText = `
            position: static;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;

        // Create a container for the main content and icons
        const contentIconContainer = document.createElement('div');
        contentIconContainer.className = 'content-icon-container';
        contentIconContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; position: static;';

        // Create a container for the main content
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        mainContent.style.cssText = 'flex-grow: 1; position: static;';

        // Create a container for the icons
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        iconContainer.style.cssText = 'display: flex; align-items: center; position: static;';

        // Move existing elements to the main content container
        const subject = notification.querySelector('.ocean-ntf-ntfitem-subject');
        const space = notification.querySelector('.ocean-ntf-ntfitem-space');
        const detail = notification.querySelector('.ocean-ntf-ntfitem-detail');

        if (subject) {
            subject.style.cssText = 'margin-bottom: 5px; font-weight: bold; position: static;';
            mainContent.appendChild(subject);
        }
        if (space) {
            space.style.cssText = 'margin-bottom: 5px; position: static;';
            mainContent.appendChild(space);
        }
        if (detail) {
            detail.style.cssText = 'margin-bottom: 5px; position: static;';
            mainContent.appendChild(detail);
        }

        // Move flag and mark icons to the icon container
        const flagIcon = notification.querySelector('.ocean-ntf-ntfitem-flag');
        const markIcon = notification.querySelector('.ocean-ntf-ntfitem-mark');

        if (flagIcon) {
            flagIcon.style.cssText = 'width: 24px; height: 24px; margin-right: 5px; cursor: pointer; position: static;';
            iconContainer.appendChild(flagIcon);
        }
        if (markIcon) {
            markIcon.style.cssText = 'width: 24px; height: 24px; cursor: pointer; position: static;';
            iconContainer.appendChild(markIcon);
        }

        // Append main content and icon container to the content-icon container
        contentIconContainer.appendChild(mainContent);
        contentIconContainer.appendChild(iconContainer);

        // Create a container for meta information
        const metaContainer = document.createElement('div');
        metaContainer.className = 'notification-meta';
        metaContainer.style.cssText = 'display: flex; justify-content: flex-start; align-items: center; margin-top: 5px; position: static;';

        // Move date and user to meta container
        const date = notification.querySelector('.ocean-ntf-ntfitem-date');
        const user = notification.querySelector('.ocean-ntf-ntfitem-user');

        if (date) {
            date.style.cssText = 'margin-right: 10px; position: static;';
            metaContainer.appendChild(date);
        }
        if (user) {
            user.style.cssText = 'position: static;';
            metaContainer.appendChild(user);
        }

        // Clear the notification and add the new structure
        notification.innerHTML = '';
        notification.appendChild(contentIconContainer);
        notification.appendChild(metaContainer);

        // Ensure all child elements are positioned properly
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