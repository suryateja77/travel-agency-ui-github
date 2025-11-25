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

const nameToPath = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') return ''
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except space and dash
    .replace(/\s+/g, '-') // Replace spaces with dash
}

const pathToName = (path: string | null | undefined): string => {
  if (!path || typeof path !== 'string') return ''
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

/**
 * Formats a number with Indian locale thousand separators (e.g., 1,00,000)
 * @param num - The number to format
 * @param options - Optional formatting options (decimals, etc.)
 * @returns Formatted number string
 */
const formatNumber = (num: number, options?: { round?: boolean }): string => {
  const numberToFormat = options?.round ? Math.round(num) : num
  return new Intl.NumberFormat('en-IN').format(numberToFormat)
}

/**
 * Generates year options for dropdown (current year and N years back)
 * @param yearsBack - Number of years to go back from current year (default: 5)
 * @returns Array of options with key and value as year strings
 */
const generateYearOptions = (yearsBack: number = 5): Array<{ key: string; value: string }> => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: yearsBack + 1 }, (_, i) => {
    const year = currentYear - i
    return { key: year.toString(), value: year.toString() }
  })
}

/**
 * Generates standard period options (Week/Month) for dropdown
 * @returns Array of period options
 */
const generatePeriodOptions = (): Array<{ key: string; value: string }> => {
  return [
    { key: 'week', value: 'week' },
    { key: 'month', value: 'month' }
  ]
}

/**
 * Downloads a file from the server using axios with optional filters
 * @param url - The API endpoint URL (without baseURL prefix)
 * @param filename - The filename for the downloaded file
 * @param filters - Optional filters to include in the request
 */
const downloadFile = async (url: string, filename: string, filters: Record<string, any> = {}) => {
  try {
    // Import the configured API get method to use the correct baseURL
    const { get } = await import('@api')
    
    const queryParams: Record<string, any> = {}
    
    // Add filters to query params
    if (filters.filterData) {
      queryParams.filterData = JSON.stringify(filters.filterData)
    }
    if (filters.sort) {
      queryParams.sort = JSON.stringify(filters.sort)
    }
    
    // Use the configured API get method which has the correct baseURL
    const response = await get(url, { 
      ...queryParams,
      responseType: 'blob',
      withCredentials: true // Include cookies for authentication
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download error:', error)
    throw error // Re-throw to allow component-level error handling
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
  formatMinutesToDuration,
  formatNumber,
  generateYearOptions,
  generatePeriodOptions,
  downloadFile
}
