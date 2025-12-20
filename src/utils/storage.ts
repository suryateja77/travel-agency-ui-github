const getStorage = (type: string) => {
  // 'local' = localStorage (shared across tabs)
  // 'session' = sessionStorage (isolated per tab)
  if (type === 'session') {
    return sessionStorage
  }
  return localStorage
}

const setStorageItem = (type: string, key: string, value: string) => {
  const storageType = getStorage(type)
  storageType.setItem(key, value)
}

const getStorageItem = (type: string, key: string) => {
  const storageType = getStorage(type)
  return storageType.getItem(key)
}

const removeStorageItem = (type: string, key: string) => {
  const storageType = getStorage(type)
  storageType.removeItem(key)
}

export { setStorageItem, getStorageItem, removeStorageItem }
