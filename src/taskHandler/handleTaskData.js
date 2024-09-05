import { getCybozuData } from '../notificationHandler/handleNotificationData.js';

export async function fetchTasks() {
    try {
        const appId = 16; // Consider making this configurable
        const query = '';
        const fields = ['baseId', 'module_type', 'module_id', 'requester', 'request_date', 'task_content', 'due_date', 'task_memo'];

        console.log('Fetching tasks from app:', appId);

        return new Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records', true), 'GET', { app: appId, query: query, fields: fields }, (resp) => {
                console.log('Tasks fetched from Kintone:', resp);
                resolve(resp.records);
            }, (error) => {
                console.error('Error fetching tasks from Kintone:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error in fetchTasks:', error);
        return [];
    }
}

export function convertTasksToNotifications(tasks) {
    return tasks.map(task => ({
        id: task.$id.value,
        moduleType: task.module_type.value,
        moduleId: task.module_id.value,
        moduleSubId: task.baseId.value,
        sender: task.requester.value[0].code,
        sentTime: task.request_date.value,
        read: false, // Tasks are always considered unread in the notification context
        mention: true,
        flagged: false,
        groupKey: `${task.module_type.value.toLowerCase()}:${task.module_id.value}:${task.$id.value}:`,
        content: {
            title: {
                text: task.$id.value
            },
            subTitle: {
                text: 'Task from Kintone'
            },
            message: {
                text: task.task_content.value
            },
            icon: getIconForModuleType(task.module_type.value)
        },
        dueDate: task.due_date.value,
        taskMemo: task.task_memo.value
    }));
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