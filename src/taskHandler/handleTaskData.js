import { getCybozuData } from '../notificationHandler/handleNotificationData.js';

export async function fetchTasks() {
    try {
        const appId = 16; // Consider making this configurable
        const query = '';

        console.log('Fetching tasks from app:', appId);

        const rawResponse = await fetch(`/k/v1/records.json?app=${appId}&query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (!rawResponse.ok) {
            throw new Error(`HTTP error! status: ${rawResponse.status}`);
        }

        const resp = await rawResponse.json();
        console.log('Tasks fetched from Kintone:', resp);
        return resp.records;
    } catch (error) {
        console.error('Error in fetchTasks:', error);
        return [];
    }
}

export function convertTasksToNotifications(tasks) {
    return tasks.map(task => {
        // Ensure all required fields are present
        if (!task.baseId || !task.module_type || !task.module_id || !task.requester || !task.request_date || !task.task_content) {
            console.error('Task is missing required fields:', task);
            return null;
        }

        return {
            id: task.baseId.value,
            moduleType: task.module_type.value,
            moduleId: task.module_id.value,
            moduleSubId: task.baseId.value,
            sender: task.requester.value[0]?.code || '',
            sentTime: task.request_date.value,
            read: false, // Tasks are always considered unread in the notification context
            mention: true,
            flagged: false,
            groupKey: `${task.module_type.value.toLowerCase()}:${task.module_id.value}:${task.baseId.value}:`,
            content: {
                title: {
                    text: task.baseId.value
                },
                subTitle: {
                    text: 'Task from Kintone'
                },
                message: {
                    text: task.task_content.value
                },
                icon: getIconForModuleType(task.module_type.value)
            },
            dueDate: task.due_date?.value || '',
            taskMemo: task.task_memo?.value || ''
        };
    }).filter(task => task !== null); // Remove any null tasks
}

function getIconForModuleType(moduleType) {
    switch (moduleType) {
        case 'APP':
            return 'https://static.cybozu.com/contents/k/image/icon/app/appTableBlue.png';
        case 'PEOPLE':
            return 'https://static.cybozu.com/contents/k/image/icon/user/user.svg';
        default:
            return 'https://static.cybozu.com/contents/k/image/icon/app/appGeneral.png';
    }
}