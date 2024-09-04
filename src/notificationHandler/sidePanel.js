export function createSidePanel() {
    const sidePanel = document.createElement('div');
    sidePanel.className = 'notification-side-panel';
    sidePanel.style.cssText = `
        width: 250px;
        height: 100vh;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
        padding: 20px;
        box-sizing: border-box;
    `;

    sidePanel.innerHTML = `
        <h2>Notifications</h2>
        <ul>
            <li>All Notifications</li>
            <li>Unread</li>
            <li>Flagged</li>
        </ul>
    `;

    return sidePanel;
}