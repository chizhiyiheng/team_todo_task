/**
 * 语音录音 Hook
 * 支持录音、转换为音频文件、上传到后台进行语音转文字
 */

import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

export function useVoiceRecorder() {
  const isRecording = ref(false)
  const isSupported = ref(false)
  const audioLevel = ref(0)
  const recordingTime = ref(0)
  
  let mediaRecorder = null
  let audioStream = null
  let audioChunks = []
  let recordingTimer = null
  let audioContext = null
  let analyser = null
  let dataArray = null

  // 检查浏览器支持
  const checkSupport = () => {
    isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)
    return isSupported.value
  }

  // 获取麦克风权限并初始化录音
  const initRecorder = async () => {
    try {
      if (!checkSupport()) {
        throw new Error('当前浏览器不支持录音功能')
      }

      // 请求麦克风权限
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // 回声消除
          noiseSuppression: true, // 噪声抑制
          autoGainControl: true,  // 自动增益控制
          sampleRate: 16000,      // 采样率 16kHz（语音识别推荐）
          channelCount: 1         // 单声道
        }
      })

      // 创建 MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus', // 优先使用 opus 编码
        audioBitsPerSecond: 128000 // 128kbps
      }

      // 检查支持的格式
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4'
        } else {
          delete options.mimeType
        }
      }

      mediaRecorder = new MediaRecorder(audioStream, options)
      
      // 设置音频分析器（用于显示音量波形）
      setupAudioAnalyser()

      // 录音数据事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      // 录音停止事件
      mediaRecorder.onstop = () => {
        console.log('录音停止，数据块数量:', audioChunks.length)
      }

      return true
    } catch (error) {
      console.error('初始化录音器失败:', error)
      
      if (error.name === 'NotAllowedError') {
        ElMessage.error('请允许访问麦克风权限')
      } else if (error.name === 'NotFoundError') {
        ElMessage.error('未找到麦克风设备')
      } else {
        ElMessage.error('录音功能初始化失败: ' + error.message)
      }
      
      return false
    }
  }

  // 设置音频分析器
  const setupAudioAnalyser = () => {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(audioStream)
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      // 开始监听音量
      monitorAudioLevel()
    } catch (error) {
      console.warn('音频分析器设置失败:', error)
    }
  }

  // 监听音量级别
  const monitorAudioLevel = () => {
    if (!analyser || !isRecording.value) return

    analyser.getByteFrequencyData(dataArray)
    
    // 计算平均音量
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length
    audioLevel.value = Math.round((average / 255) * 100)

    if (isRecording.value) {
      requestAnimationFrame(monitorAudioLevel)
    }
  }

  // 开始录音
  const startRecording = async () => {
    try {
      if (!mediaRecorder) {
        const success = await initRecorder()
        if (!success) return false
      }

      // 清空之前的录音数据
      audioChunks = []
      recordingTime.value = 0
      
      // 开始录音
      mediaRecorder.start(100) // 每100ms收集一次数据
      isRecording.value = true
      
      // 开始计时
      recordingTimer = setInterval(() => {
        recordingTime.value += 1
      }, 1000)

      // 开始监听音量
      monitorAudioLevel()

      ElMessage.success('开始录音')
      return true
    } catch (error) {
      console.error('开始录音失败:', error)
      ElMessage.error('开始录音失败')
      return false
    }
  }

  // 停止录音
  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorder || !isRecording.value) {
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        isRecording.value = false
        
        // 停止计时
        if (recordingTimer) {
          clearInterval(recordingTimer)
          recordingTimer = null
        }

        // 创建音频文件
        const audioBlob = new Blob(audioChunks, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        })
        
        console.log('录音完成:', {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: recordingTime.value
        })

        resolve(audioBlob)
      }

      mediaRecorder.stop()
      ElMessage.success('录音完成')
    })
  }

  // 取消录音
  const cancelRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
      audioChunks = []
      recordingTime.value = 0
      
      if (recordingTimer) {
        clearInterval(recordingTimer)
        recordingTimer = null
      }
      
      ElMessage.info('录音已取消')
    }
  }

  // 转换音频格式（如果需要）
  const convertAudioFormat = async (audioBlob, targetFormat = 'wav') => {
    // 这里可以使用 Web Audio API 进行格式转换
    // 或者直接发送原始格式给后台处理
    return audioBlob
  }

  // 清理资源
  const cleanup = () => {
    if (recordingTimer) {
      clearInterval(recordingTimer)
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
    }
    
    if (audioContext) {
      audioContext.close()
    }
    
    mediaRecorder = null
    audioStream = null
    audioContext = null
    analyser = null
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 状态
    isRecording,
    isSupported,
    audioLevel,
    recordingTime,
    
    // 方法
    checkSupport,
    initRecorder,
    startRecording,
    stopRecording,
    cancelRecording,
    convertAudioFormat,
    cleanup
  }
}