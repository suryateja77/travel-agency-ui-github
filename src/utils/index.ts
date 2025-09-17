import { Configuration } from '@types'

type obj = Record<string, any>

const isEmpty = (value: any) => value === undefined || value === null || value === ''

const isArray = (target: string[]) => Object.prototype.toString.call(target) === '[object Array]'

const isObject = (target: obj) => typeof target === 'object' && target

const computeValue = (obj: obj, map: string): any => !isEmpty(map) && map.split('.').reduce((a, b) => (a && !isEmpty(a[b]) ? a[b] : ''), obj)

const validatePayload = (schema: Array<{ path: string; pattern: RegExp; message: string; emptyCheck: boolean; custom?: any }>, model: {}, params = {}) => {
  const errorMap: Record<string, any> = {}
  let count = 0
  schema.forEach(({ path, custom, pattern, message, emptyCheck }) => {
    const value = computeValue(model, path)
    const isInvalid = custom ? !custom(model, value, params) : (emptyCheck || value) && !pattern.test(value)
    if (!errorMap[path] && isInvalid) {
      count += 1
      errorMap[path] = message
    }
  })

  return {
    isValid: count === 0,
    errorMap,
  }
}

const bemClass = (input: any = []) => {
  let [blk, elt, mods, className] = input
  const result: string[] = []
  if (isArray(elt) || isObject(elt)) {
    className = mods
    mods = elt
    elt = ''
  }

  const eltClass = elt ? `${blk}__${elt}` : blk
  result.push(eltClass)

  if (isArray(mods)) {
    mods.forEach((mod: any) => {
      const classStr = elt ? `${blk}__${elt}--${mod}` : `${blk}--${mod}`
      result.push(classStr)
    })
  }

  if (isObject(mods) && !isArray(mods)) {
    const modObjKeys = Object.keys(mods)
    modObjKeys.forEach(key => {
      if (mods[key]) {
        const classStr = elt ? `${blk}__${elt}--${key}` : `${blk}--${key}`
        result.push(classStr)
      }
    })
  }

  if (className) {
    result.push(className)
  }

  return result.join(' ')
}

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })

  return formattedDate
}

const chunkArray = (arr: Array<any>, chunkSize = 3) => {
  const result = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize))
  }
  return result
}

const normalizeWhitespace = (str: string) => {
  return str.trim().replace(/\s+/g, '')
}

const nameToPath = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and dash
    .replace(/\s+/g, '-') // Replace spaces with dash
}

const pathToName = (path: string): string => {
  return path
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim()
}

const transformConfigurations = (configurations: Configuration[], type: 'input' | 'navigation' = 'input') => {
  const result: { [key: string]: any } = {}
  configurations.forEach(configItem => {
    result[configItem.name] = configItem.configurationItems.map(item =>
      type === 'input'
        ? {
            key: item.name,
            value: item.name,
          }
        : { path: `/${nameToPath(item.name)}`, name: item.name },
    )
  })
  return result
}

const getValueByPath = (obj: Record<string, any>, path: string): any => {
  if (!obj || !path) return ''
  return path.split('.').reduce((acc, key) => {
    if (acc && acc.hasOwnProperty(key)) {
      return acc[key]
    }
    return ''
  }, obj)
}

/**
 * Formats a Date object for use in datetime-local input fields
 * Converts date to local time format: YYYY-MM-DDTHH:MM
 */
const formatDateTimeForInput = (date: Date | null): string => {
  if (!date) return ''
  
  const localDate = new Date(date)
  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')
  const day = String(localDate.getDate()).padStart(2, '0')
  const hours = String(localDate.getHours()).padStart(2, '0')
  const minutes = String(localDate.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Parses datetime-local input value to Date object
 * Input value is interpreted as local time
 */
const parseDateTimeFromInput = (value: string): Date | null => {
  if (!value) return null
  // Create date object which will be interpreted as local time
  return new Date(value)
}

const formatDateValueForDisplay = (value: Date | null): string => {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatBooleanValueForDisplay = (value: boolean): string => {
  return value ? 'Yes' : 'No'
}

const formatMinutesToDuration = (totalMinutes: number | null): string => {
  if (!totalMinutes || totalMinutes <= 0) return '-'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
}

export { 
  computeValue, 
  bemClass, 
  debounce, 
  formatDate, 
  validatePayload, 
  chunkArray, 
  normalizeWhitespace, 
  transformConfigurations, 
  getValueByPath, 
  pathToName, 
  nameToPath,
  formatDateTimeForInput,
  parseDateTimeFromInput,
  formatDateValueForDisplay,
  formatBooleanValueForDisplay,
  formatMinutesToDuration
}
