import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Consistent safe-area wrapper for screens.
 * Use edges={['bottom']} for drawer screens that already have a navigation header.
 * Use edges={['top', 'bottom']} (default) for full-screen stack/modal screens.
 */
export default function ScreenContainer({ children, style, edges = ['top', 'bottom'] }) {
    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFFFFF' }, style]} edges={edges}>
            {children}
        </SafeAreaView>
    );
}
