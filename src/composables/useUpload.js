import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api'

/**
 * useUpload Composable
 * 
 * Provides shared logic for file uploading and deletion.
 * 
 * @returns {Object} Upload states and methods
 */
export function useUpload() {
    const { t } = useI18n()

    const isUploading = ref(false)

    /**
     * Upload a file
     * @param {File} file - The file object to upload
     * @returns {Promise<Object|null>} - The uploaded file data or null if failed
     */
    const upload = async (file) => {
        if (!file) return null

        isUploading.value = true
        try {
            const response = await todoApi.uploadFile(file)

            if (response.code === '200') {
                return {
                    fileId: response.data.fileId,
                    fileName: response.data.fileName,
                    fileSize: response.data.fileSize,
                    fileType: response.data.fileType,
                    filePath: response.data.filePath,
                    uploadTime: response.data.uploadTime
                }
            } else {
                ElMessage.error(response.message || t('task.operationFailed'))
                return null
            }
        } catch (error) {
            console.error('Upload failed:', error)
            ElMessage.error(t('task.operationFailed'))
            return null
        } finally {
            isUploading.value = false
        }
    }

    /**
     * Delete a file
     * @param {String} fileId - The ID of the file to delete
     * @returns {Promise<Boolean>} - True if success, false otherwise
     */
    const deleteFile = async (fileId) => {
        if (!fileId) return false

        try {
            const response = await todoApi.deleteFile(fileId)

            if (response.code === '200') {
                return true
            } else {
                ElMessage.error(response.message || t('task.operationFailed'))
                return false
            }
        } catch (error) {
            console.error('Delete file failed:', error)
            ElMessage.error(t('task.operationFailed'))
            return false
        }
    }

    return {
        isUploading,
        upload,
        deleteFile
    }
}
