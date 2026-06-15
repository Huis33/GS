export function getAlertBorderStyle(type) {
    switch (type) {
        case 'overdue':
            return { borderLeftWidth: 6, borderLeftColor: '#E74C3C' };
        case 'due_soon':
            return { borderLeftWidth: 6, borderLeftColor: '#F39C12' };
        case 'new_task':
            return { borderLeftWidth: 6, borderLeftColor: '#6389DA' };
        case 'task_updated':
            return { borderLeftWidth: 6, borderLeftColor: '#9B59B6' };
        default:
            return { borderLeftWidth: 6, borderLeftColor: '#94A3B8' };
    }
}
