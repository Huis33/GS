// src/utils/fileDownloader.js
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const saveAndShareFile = async (uri, fileName, mimeType = 'application/pdf') => {
    try {
        if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    mimeType
                );
                await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert("Success", "File saved successfully.");
                return true;
            }
            return false;
        } else {
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType });
            return true;
        }
    } catch (error) {
        console.error("File download error:", error);
        throw error;
    }
};