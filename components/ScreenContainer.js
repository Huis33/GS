import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScreenContainer({ children, style }) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor: '#fff',
                    paddingTop: insets.top * 0.5, // reduce effect here
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}