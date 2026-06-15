import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabBarStyle() {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, 8);

    return {
        height: 56 + bottomPad,
        paddingBottom: bottomPad,
        paddingTop: 8,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    };
}
