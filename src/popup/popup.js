const STORAGE_KEYS = [
  'tf_enabled', 'tf_pattern',
  'fl_enabled', 'fl_mode',
  'ip_enabled',
  'rs_enabled', 'rs_token',
  'mi_enabled',
  'bt_enabled', 'bt_position', 'bt_threshold'
]

const DEFAULTS = {
  tf_enabled: true,
  tf_pattern: 'YY-MM-DD HH:mm',
  fl_enabled: true,
  fl_mode: 'list',
  ip_enabled: true,
  rs_enabled: false,
  rs_token: '',
  mi_enabled: true,
  bt_enabled: true,
  bt_position: 'right',
  bt_threshold: 300
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings()
  bindEvents()
})

function loadSettings() {
  chrome.storage.sync.get(STORAGE_KEYS, (result) => {
    STORAGE_KEYS.forEach(key => {
      const value = result[key] !== undefined ? result[key] : DEFAULTS[key]
      const input = document.querySelector(`[data-key="${key}"]`)
      if (!input) return
      if (input.type === 'checkbox') {
        input.checked = value
      } else {
        input.value = value
      }
    })
  })
}

function bindEvents() {
  document.querySelectorAll('.ge-switch input').forEach(input => {
    input.addEventListener('change', () => {
      const key = input.dataset.key
      saveSetting(key, input.checked)
    })
  })

  document.querySelectorAll('.ge-input, .ge-select').forEach(input => {
    const eventType = input.tagName === 'SELECT' ? 'change' : 'blur'
    input.addEventListener(eventType, () => {
      const key = input.dataset.key
      let value = input.value
      if (input.type === 'number') {
        value = parseInt(value, 10) || 0
      }
      saveSetting(key, value)
    })
  })

  document.querySelectorAll('.ge-module-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.ge-switch')) return
      const module = header.closest('.ge-module')
      const options = module.querySelector('.ge-module-options')
      if (!options) return
      const isVisible = options.style.display !== 'none'
      options.style.display = isVisible ? 'none' : 'block'
    })
  })

}

function saveSetting(key, value) {
  const data = { [key]: value }
  chrome.storage.sync.set(data, () => {
    showStatus('已保存')
  })
}

function showStatus(msg) {
  const el = document.getElementById('ge-status')
  el.textContent = msg
  el.style.opacity = '1'
  setTimeout(() => { el.style.opacity = '0' }, 1500)
}
