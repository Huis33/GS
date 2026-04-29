import { ActivityIndicator, View } from 'react-native';

export default function Page() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#000" />
        </View>
    );
}