<template>
  <el-dialog
    v-model="visible"
    title="语音转待办"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="voice-recorder">
      <!-- 录音状态显示 -->
      <div class="recorder-status">
        <div class="status-icon" :class="{ recording: isRecording }">
          <el-icon v-if="!isRecording"><Microphone /></el-icon>
          <el-icon v-else class="recording-icon"><VideoCamera /></el-icon>
        </div>
        
        <div class="status-text">
          <div v-if="!isRecording && !audioBlob">点击开始录音</div>
          <div v-else-if="isRecording">
            正在录音... {{ formatTime(recordingTime) }}
          </div>
          <div v-else-if="audioBlob && !transcribedText">
            录音完成，点击转换为文字
          </div>
          <div v-else-if="isTranscribing">
            正在转换为文字...
          </div>
          <div v-else>转换完成</div>
        </div>

        <!-- 音量指示器 -->
        <div v-if="isRecording" class="audio-level">
          <div class="level-bar">
            <div 
              class="level-fill" 
              :style="{ width: audioLevel + '%' }"
            ></div>
          </div>
          <span class="level-text">{{ audioLevel }}%</span>
        </div>
      </div>

      <!-- 录音控制按钮 -->
      <div class="recorder-controls">
        <el-button
          v-if="!isRecording && !audioBlob"
          type="primary"
          size="large"
          :disabled="!isSupported"
          @click="startRecording"
          circle
        >
          <el-icon><Microphone /></el-icon>
        </el-button>

        <template v-else-if="isRecording">
          <el-button
            type="success"
            size="large"
            @click="stopRecording"
            circle
          >
            <el-icon><VideoPause /></el-icon>
          </el-button>
          <el-button
            type="danger"
            size="large"
            @click="cancelRecording"
            circle
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </template>

        <template v-else-if="audioBlob">
          <el-button
            type="primary"
            :loading="isTranscribing"
            @click="transcribeAudio"
          >
            转换为文字
          </el-button>
          <el-button @click="resetRecording">重新录音</el-button>
        </template>
      </div>

      <!-- 转换结果 -->
      <div v-if="transcribedText" class="transcription-result">
        <el-divider>转换结果</el-divider>
        <el-input
          v-model="editableText"
          type="textarea"
          :rows="4"
          placeholder="转换的文字内容"
          maxlength="500"
          show-word-limit
        />
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!editableText"
          @click="createTodoFromText"
        >
          创建待办
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Microphone, 
  VideoCamera, 
  VideoPause, 
  Close 
} from '@element-plus/icons-vue'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import { todoApi } from '@/api/index.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'todo-created'])

// 对话框显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 使用录音 Hook
const {
  isRecording,
  isSupported,
  audioLevel,
  recordingTime,
  startRecording: startRec,
  stopRecording: stopRec,
  cancelRecording: cancelRec
} = useVoiceRecorder()

// 组件状态
const audioBlob = ref(null)
const transcribedText = ref('')
const editableText = ref('')
const isTranscribing = ref(false)
const errorMessage = ref('')

// 格式化时间显示
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 开始录音
const startRecording = async () => {
  errorMessage.value = ''
  const success = await startRec()
  if (!success) {
    errorMessage.value = '录音启动失败，请检查麦克风权限'
  }
}

// 停止录音
const stopRecording = async () => {
  const blob = await stopRec()
  if (blob) {
    audioBlob.value = blob
    console.log('录音文件大小:', (blob.size / 1024).toFixed(2) + 'KB')
  }
}

// 取消录音
const cancelRecording = () => {
  cancelRec()
  resetRecording()
}

// 重置录音状态
const resetRecording = () => {
  audioBlob.value = null
  transcribedText.value = ''
  editableText.value = ''
  errorMessage.value = ''
}

// 转换音频为文字
const transcribeAudio = async () => {
  if (!audioBlob.value) return

  try {
    isTranscribing.value = true
    errorMessage.value = ''

    // 创建 FormData 上传音频文件
    const formData = new FormData()
    formData.append('audio', audioBlob.value, 'recording.webm')
    formData.append('language', 'zh-CN') // 中文
    formData.append('format', audioBlob.value.type)

    // 调用语音转文字接口
    const response = await todoApi.transcribeAudio(formData)

    if (response.code === '200' && response.data) {
      transcribedText.value = response.data.text || ''
      editableText.value = transcribedText.value
      
      if (!transcribedText.value) {
        errorMessage.value = '未识别到语音内容，请重新录音'
      }
    } else {
      throw new Error(response.message || '语音转换失败')
    }
  } catch (error) {
    console.error('语音转文字失败:', error)
    errorMessage.value = error.message || '语音转换失败，请重试'
  } finally {
    isTranscribing.value = false
  }
}

// 根据文字创建待办
const createTodoFromText = async () => {
  if (!editableText.value.trim()) return

  try {
    // 这里可以调用创建待办的接口
    emit('todo-created', {
      title: editableText.value.trim(),
      source: 'voice' // 标记来源为语音
    })
    
    ElMessage.success('待办创建成功')
    handleClose()
  } catch (error) {
    console.error('创建待办失败:', error)
    ElMessage.error('创建待办失败')
  }
}

// 关闭对话框
const handleClose = () => {
  if (isRecording.value) {
    cancelRecording()
  }
  resetRecording()
  visible.value = false
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    resetRecording()
  }
})
</script>

<style scoped lang="scss">
.voice-recorder {
  text-align: center;
  padding: 20px 0;

  .recorder-status {
    margin-bottom: 30px;

    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      transition: all 0.3s;

      .el-icon {
        font-size: 32px;
        color: #909399;
      }

      &.recording {
        background: #ff4757;
        animation: pulse 1.5s infinite;

        .recording-icon {
          color: white;
        }
      }
    }

    .status-text {
      font-size: 16px;
      color: #606266;
      margin-bottom: 16px;
    }

    .audio-level {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .level-bar {
        width: 200px;
        height: 6px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;

        .level-fill {
          height: 100%;
          background: linear-gradient(90deg, #67c23a, #e6a23c, #f56c6c);
          transition: width 0.1s;
        }
      }

      .level-text {
        font-size: 12px;
        color: #909399;
        min-width: 35px;
      }
    }
  }

  .recorder-controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;

    .el-button {
      width: 60px;
      height: 60px;

      .el-icon {
        font-size: 24px;
      }
    }
  }

  .transcription-result {
    margin-top: 20px;
    text-align: left;
  }

  .error-message {
    margin-top: 16px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
  }
}

.dialog-footer {
  text-align: right;
}
</style>