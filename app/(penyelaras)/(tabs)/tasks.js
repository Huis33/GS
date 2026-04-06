import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TasksPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>My Assigned Tasks</Text>
            {/* We can build the list UI here next */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});