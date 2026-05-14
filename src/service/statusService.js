import { COLORS } from '../../constants/theme';

export const getStatusStyles = (status) => {
    switch (status) {
        case 'Not Yet Started':
            return { bg: '#FFDCDC', text: '#C0392B' };
        case 'In Progress':
            return { bg: '#F5EFEB', text: '#A67C52' };
        case 'Done':
            return { bg: '#D5FFD6', text: COLORS.success };
        case 'Not Yet Assigned':
            return { bg: '#F1F5F9', text: COLORS.info };
        default:
            return { bg: COLORS.background, text: '#374151' };
    }
};