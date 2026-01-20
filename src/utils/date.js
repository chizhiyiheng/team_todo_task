import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

dayjs.locale('zh-cn')

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

export const formatTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('HH:mm:ss')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  return dayjs(date).fromNow()
}

export const isToday = (date) => {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

export const isOverdue = (date) => {
  if (!date) return false
  return dayjs(date).isBefore(dayjs())
}

export const getDaysDiff = (date1, date2) => {
  if (!date1 || !date2) return 0
  return dayjs(date1).diff(dayjs(date2), 'day')
}

export const getHoursDiff = (date1, date2) => {
  if (!date1 || !date2) return 0
  return dayjs(date1).diff(dayjs(date2), 'hour')
}

export const getMinutesDiff = (date1, date2) => {
  if (!date1 || !date2) return 0
  return dayjs(date1).diff(dayjs(date2), 'minute')
}

export const countDownFormat = (timestamp, endTime) => {
  if (!endTime) return ''
  const now = dayjs(timestamp).unix()
  const end = dayjs(endTime).unix()
  const diff = end - now

  if (diff <= 0) return '已过期'

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)

  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

export const daytz = () => {
  return dayjs().tz()
}

export const updateTimezone = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  dayjs.tz.setDefault(timezone)
}

export const expiresFormat = (date) => {
  if (!date) return ''
  const now = dayjs()
  const target = dayjs(date)
  const diff = target.diff(now, 'day')

  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 0) return `${diff}天后`
  return `${Math.abs(diff)}天前`
}

export const completeAtFormat = (date) => {
  if (!date) return ''
  const now = dayjs()
  const target = dayjs(date)
  const diff = now.diff(target, 'day')

  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff > 0) return `${diff}天前`
  return '刚刚'
}
