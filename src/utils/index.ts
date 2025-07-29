import { Configuration } from "@types"

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

const transformConfigurations = (configurations: Configuration[]) => {
  const result: { [key: string]: { key: string; value: string }[] } = {}
  configurations.forEach(configItem => {
    result[configItem.name] = configItem.configurationItems.map(item => ({
      key: item.name,
      value: item.name,
    }))
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

export { computeValue, bemClass, debounce, formatDate, validatePayload, chunkArray, normalizeWhitespace, transformConfigurations, getValueByPath }
