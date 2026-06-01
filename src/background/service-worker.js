import '../lib/defaults.js'

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
    console.warn('[Material Icons] Failed to check for updates (offline?):', e.message)
  }
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.sync.set(globalThis.GE_DEFAULTS)
  }
  checkForMaterialIconsUpdate()
})

chrome.runtime.onStartup.addListener(function () {
  checkForMaterialIconsUpdate()
})

setInterval(function () { checkForMaterialIconsUpdate() }, HOURS(24))
