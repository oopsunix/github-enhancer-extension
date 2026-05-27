const DEFAULTS = {
  tf_enabled: true,
  tf_pattern: 'YY-MM-DD HH:mm',
  ip_enabled: true,
  ip_mode: 'list',
  rs_enabled: false,
  rs_token: '',
  mi_enabled: true,
  bt_enabled: true,
  bt_position: 'right',
  bt_threshold: 300
}

var BASE_URL = 'https://rettend.github.io/github-material-icon-theme/download'
var GET = function (url) { return fetch(BASE_URL + '/' + url) }
var HOURS = function (n) { return n * 60 * 60 * 1000 }

async function checkForMaterialIconsUpdate() {
  try {
    var response = await GET('version.txt')
    var latestVersion = (await response.text()).trim()
    var data = await chrome.storage.local.get('mi_version')
    if (data.mi_version !== latestVersion) {
      var results = await Promise.all([
        GET('style.css').then(function (r) { return r.text() }),
        GET('material-icons.json').then(function (r) { return r.json() }),
        GET('language-map.json').then(function (r) { return r.json() })
      ])
      await chrome.storage.local.set({
        mi_version: latestVersion,
        mi_css: results[0],
        mi_materialIcons: results[1],
        mi_languageMap: results[2]
      })
      return { updated: true, version: latestVersion }
    }
    return { updated: false }
  } catch (e) {
    console.error('[Material Icons] Failed to check for updates:', e)
    throw e
  }
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set(DEFAULTS)
  }
  checkForMaterialIconsUpdate()
})

chrome.runtime.onStartup.addListener(function () {
  checkForMaterialIconsUpdate()
})

setInterval(function () { checkForMaterialIconsUpdate() }, HOURS(24))
