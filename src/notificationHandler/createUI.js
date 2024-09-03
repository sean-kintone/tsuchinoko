export function createOverlay() {
    const existingOverlay = document.getElementById('hello-world-overlay');
    if (existingOverlay) {
        return;
    }

    const targetElement = document.querySelector('.ocean-ntf-ntflist-content');
    if (targetElement) {
        const overlay = document.createElement('div');
        overlay.id = 'hello-world-overlay';
        overlay.textContent = 'Hello World';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
            font-size: 24px;
            font-weight: bold;
            z-index: 9999;
            pointer-events: auto;
            cursor: default;
        `;
        targetElement.style.position = 'relative';
        targetElement.appendChild(overlay);

        // Prevent default behavior for all mouse and touch events
        overlay.addEventListener('mousedown', e => e.preventDefault());
        overlay.addEventListener('touchstart', e => e.preventDefault());

        // Stop propagation of all events
        ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'touchmove'].forEach(eventType => {
            overlay.addEventListener(eventType, e => e.stopPropagation(), true);
        });
    }
}

export function updateOverlay() {
    const targetElement = document.querySelector('.ocean-ntf-ntflist-content');
    const overlay = document.getElementById('hello-world-overlay');
    if (targetElement && overlay) {
        overlay.style.width = `${targetElement.scrollWidth}px`;
        overlay.style.height = `${targetElement.scrollHeight}px`;
    }
}