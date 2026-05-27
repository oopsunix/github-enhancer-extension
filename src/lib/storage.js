const STORAGE_KEYS = {
  TIME_FORMAT_ENABLED: 'tf_enabled',
  TIME_FORMAT_PATTERN: 'tf_pattern',
  IMAGE_PREVIEW_ENABLED: 'ip_enabled',
  IMAGE_PREVIEW_MODE: 'ip_mode',
  REPO_SIZE_ENABLED: 'rs_enabled',
  REPO_SIZE_TOKEN: 'rs_token',
  BACK_TO_TOP_ENABLED: 'bt_enabled',
  BACK_TO_TOP_POSITION: 'bt_position',
  BACK_TO_TOP_THRESHOLD: 'bt_threshold'
}

const DEFAULTS = {
  [STORAGE_KEYS.TIME_FORMAT_ENABLED]: true,
  [STORAGE_KEYS.TIME_FORMAT_PATTERN]: 'YY-MM-DD HH:mm',
  [STORAGE_KEYS.IMAGE_PREVIEW_ENABLED]: true,
  [STORAGE_KEYS.IMAGE_PREVIEW_MODE]: 'list',
  [STORAGE_KEYS.REPO_SIZE_ENABLED]: true,
  [STORAGE_KEYS.REPO_SIZE_TOKEN]: '',
  [STORAGE_KEYS.BACK_TO_TOP_ENABLED]: true,
  [STORAGE_KEYS.BACK_TO_TOP_POSITION]: 'right',
  [STORAGE_KEYS.BACK_TO_TOP_THRESHOLD]: 300
}

async function get(key) {
  const result = await chrome.storage.sync.get(key)
  if (result[key] === undefined) {
    return DEFAULTS[key]
  }
  return result[key]
}

async function getAll() {
  const result = await chrome.storage.sync.get(null)
  return { ...DEFAULTS, ...result }
}

async function set(key, value) {
  await chrome.storage.sync.set({ [key]: value })
}

async function setMultiple(items) {
  await chrome.storage.sync.set(items)
}

async function resetAll() {
  await chrome.storage.sync.clear()
}

function onChange(callback) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      callback(changes)
    }
  })
}

export { STORAGE_KEYS, DEFAULTS, get, getAll, set, setMultiple, resetAll, onChange }
