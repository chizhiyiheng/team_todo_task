export const isObject = (obj) => {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

export const isArray = (arr) => {
  return Array.isArray(arr)
}

export const isString = (str) => {
  return typeof str === 'string'
}

export const isNumber = (num) => {
  return typeof num === 'number' && !isNaN(num)
}

export const isBoolean = (bool) => {
  return typeof bool === 'boolean'
}

export const isFunction = (fn) => {
  return typeof fn === 'function'
}

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (isString(value)) return value.trim() === ''
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

export const cloneJSON = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

export const deepClone = (obj) => {
  return cloneJSON(obj)
}

export const inArray = (key, array, regular = false) => {
  if (!isArray(array)) return false
  if (regular) {
    return !!array.find(item => {
      if (item && item.indexOf('*')) {
        const rege = new RegExp('^' + item.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') + '$', 'g')
        if (rege.test(key)) return true
      }
      return item == key
    })
  } else {
    return array.includes(key)
  }
}

export const last = (array) => {
  if (!isArray(array) || array.length === 0) return null
  return array[array.length - 1]
}

export const first = (array) => {
  if (!isArray(array) || array.length === 0) return null
  return array[0]
}

export const unique = (array, key) => {
  if (!isArray(array)) return []
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const k = item[key]
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }
  return [...new Set(array)]
}

export const groupBy = (array, key) => {
  if (!isArray(array)) return {}
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

export const sortBy = (array, key, order = 'asc') => {
  if (!isArray(array)) return []
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1
    } else {
      return a[key] < b[key] ? 1 : -1
    }
  })
}

export const chunk = (array, size) => {
  if (!isArray(array)) return []
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export const flatten = (array) => {
  if (!isArray(array)) return []
  return array.reduce((acc, val) => {
    return acc.concat(isArray(val) ? flatten(val) : val)
  }, [])
}

export const pick = (obj, keys) => {
  if (!isObject(obj)) return {}
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

export const omit = (obj, keys) => {
  if (!isObject(obj)) return {}
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export const merge = (...objects) => {
  return Object.assign({}, ...objects)
}

export const getObject = (obj, path, defaultValue = undefined) => {
  if (!isObject(obj)) return defaultValue
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return defaultValue
    }
  }
  return result
}

export const setObject = (obj, path, value) => {
  if (!isObject(obj)) return obj
  const keys = path.split('.')
  const lastKey = keys.pop()
  let current = obj
  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }
  current[lastKey] = value
  return obj
}
