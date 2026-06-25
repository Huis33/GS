// src/utils/fileDownloader.js
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Derives MIME type from a filename extension.
 */
const getMimeType = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const mimeMap = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain',
        csv: 'text/csv',
        zip: 'application/zip',
    };
    return mimeMap[ext] || 'application/octet-stream';
};

export const saveAndShareFile = async (uri, fileName, mimeType) => {
    // Auto-detect MIME type from filename if not explicitly provided
    const resolvedMimeType = mimeType || getMimeType(fileName);

    try {
        if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    resolvedMimeType
                );
                await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert("Success", "File saved successfully.");
                return true;
            }
            return false;
        } else {
            await Sharing.shareAsync(uri, { UTI: resolvedMimeType, mimeType: resolvedMimeType });
            return true;
        }
    } catch (error) {
        console.error("File download error:", error);
        throw error;
    }
};