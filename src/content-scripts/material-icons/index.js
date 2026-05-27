(function () {
  'use strict'

  var ENABLED = true
  var observer = null

  var processedMainFileNames = new Set()
  var processedTreeFileNames = new Set()
  var processedTreeFolders = new Map()
  var processedActionListFileNames = new Set()
  var processedActionListFolders = new Map()

  function $(s, c) { return (c || document).querySelector(s) }
  function $$(s, c) { return Array.from((c || document).querySelectorAll(s)) }

  function hasIconClass(el) {
    if (!el || !el.classList) return false
    for (var i = 0; i < el.classList.length; i++) {
      if (el.classList[i].indexOf('ICON_') === 0) return true
    }
    return false
  }

  function isLightMode() {
    var mode = document.documentElement.getAttribute('data-color-mode')
    return mode === 'light'
  }

  /* ============================================
     Dynamic icon lookup (mirrors reference project)
     ============================================ */
  var data = null

  function getIconClass(pairs) {
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]
      if (pair.lookup && pair.key !== undefined && pair.key !== null && pair.key !== '') {
        var result = pair.lookup[pair.key]
        if (result) return 'ICON_' + result
      }
    }
    return null
  }

  function getFileClass(fileName) {
    if (!fileName || !data) return null
    fileName = fileName.toLowerCase()
    var parts = fileName.split('.')
    var longExtension = parts.slice(1).join('.')
    var shortExtension = parts.pop() || ''
    var light = data.materialIcons.light || {}
    var pairs = [
      { key: fileName, lookup: isLightMode() ? light.fileNames : undefined },
      { key: fileName, lookup: data.materialIcons.fileNames },
      { key: longExtension, lookup: isLightMode() ? light.fileExtensions : undefined },
      { key: longExtension, lookup: data.materialIcons.fileExtensions },
      { key: shortExtension, lookup: data.materialIcons.fileExtensions },
      { key: shortExtension, lookup: data.languageMap.fileExtensions }
    ]
    return getIconClass(pairs)
  }

  function getFolderClass(fileName, isOpen) {
    if (!fileName || !data) return null
    fileName = fileName.toLowerCase()
    var folderMap = isOpen ? data.materialIcons.folderNamesExpanded : data.materialIcons.folderNames
    var light = data.materialIcons.light || {}
    var lightFolderMap = isOpen ? light.folderNamesExpanded : light.folderNames
    var pairs = [
      { key: fileName, lookup: isLightMode() ? lightFolderMap : undefined },
      { key: fileName, lookup: folderMap }
    ]
    return getIconClass(pairs)
  }

  function injectIconCSS(css) {
    var style = document.getElementById('ge-mi-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'ge-mi-style'
      document.head.appendChild(style)
    }
    style.textContent = css
  }

  function loadDataAndStart() {
    chrome.storage.local.get(['mi_css', 'mi_materialIcons', 'mi_languageMap'], function (r) {
      if (r.mi_css && r.mi_materialIcons) {
        data = {
          css: r.mi_css,
          materialIcons: r.mi_materialIcons,
          languageMap: r.mi_languageMap || { fileExtensions: {} }
        }
        injectIconCSS(data.css)
      }
      startWatcher()
    })
  }

  function callback() {
    if (!data) return

    /* --- Main file list --- */
    var mainFileNames = $$('div.react-directory-truncate a')
    mainFileNames.forEach(function (link) {
      var svg = link.closest('div.react-directory-filename-column')
        ? link.closest('div.react-directory-filename-column').querySelector('svg')
        : null
      if (!svg) return
      if (hasIconClass(svg)) {
        processedMainFileNames.add(link)
        return
      }
      var fileName = (link.textContent || '').trim()
      if (svg.classList.contains('icon-directory')) {
        svg.classList.add(getFolderClass(fileName, false) || 'ICON_folder')
      } else {
        svg.classList.add(getFileClass(fileName) || 'ICON_file')
      }
      processedMainFileNames.add(link)
    })

    /* --- Tree view folders --- */
    var treeFolderNames = $$('span.PRIVATE_TreeView-item-content-text span')
    treeFolderNames.forEach(function (el) {
      var parentContent = el.closest('div.PRIVATE_TreeView-item-content')
      if (!parentContent) return
      var svg = parentContent.querySelector('div.PRIVATE_TreeView-directory-icon svg')
      if (!svg) return
      var isOpen = svg.classList.contains('octicon-file-directory-open-fill')
      if (hasIconClass(svg) && processedTreeFolders.has(el) && isOpen === processedTreeFolders.get(el)) return
      var folderName = (el.textContent || '').trim()
      svg.classList.add(getFolderClass(folderName, isOpen) || (isOpen ? 'ICON_folder-open' : 'ICON_folder'))
      processedTreeFolders.set(el, isOpen)
    })

    /* --- Tree view files --- */
    var treeFileSelectors = [
      'span.PRIVATE_TreeView-item-content-text a',
      'span.PRIVATE_TreeView-item-content-text span'
    ]
    treeFileSelectors.forEach(function (selector) {
      $$(selector).forEach(function (el) {
        if (processedTreeFolders.has(el)) return
        var parentContent = el.closest('div.PRIVATE_TreeView-item-content')
        if (!parentContent) return
        var svg = parentContent.querySelector('div.PRIVATE_TreeView-item-visual svg')
        if (!svg) return
        if (hasIconClass(svg)) {
          processedTreeFileNames.add(el)
          return
        }
        var fileName = (el.textContent || '').trim()
        svg.classList.add(getFileClass(fileName) || 'ICON_file')
        processedTreeFileNames.add(el)
      })
    })

    /* --- Action list folders --- */
    var actionListFolders = $$('li[data-tree-entry-type="directory"] > .ActionList-content .ActionList-item-label')
    actionListFolders.forEach(function (el) {
      var button = el.closest('button.ActionList-content')
      var isOpen = button ? button.getAttribute('aria-expanded') === 'true' : false
      var svg = el.closest('.ActionList-content')
        ? el.closest('.ActionList-content').querySelector('.ActionList-item-visual--leading svg')
        : null
      if (!svg) return
      if (hasIconClass(svg)) {
        processedActionListFolders.set(el, isOpen)
        return
      }
      var folderName = (el.textContent || '').trim()
      svg.classList.add(getFolderClass(folderName, isOpen) || (isOpen ? 'ICON_folder-open' : 'ICON_folder'))
      processedActionListFolders.set(el, isOpen)
    })

    /* --- Action list files --- */
    var actionListFiles = $$('li[data-tree-entry-type="file"] > .ActionList-content .ActionList-item-label')
    actionListFiles.forEach(function (el) {
      var svg = el.closest('.ActionList-content')
        ? el.closest('.ActionList-content').querySelector('.ActionList-item-visual--leading svg')
        : null
      if (!svg) return
      if (hasIconClass(svg)) {
        processedActionListFileNames.add(el)
        return
      }
      var fileName = (el.textContent || '').trim()
      svg.classList.add(getFileClass(fileName) || 'ICON_file')
      processedActionListFileNames.add(el)
    })

    /* --- Extra: folder-row-0 --- */
    var topSvg = document.querySelector('#folder-row-0 svg')
    if (topSvg && !hasIconClass(topSvg)) {
      topSvg.classList.add('ICON_folder')
    }
  }

  function startWatcher() {
    if (observer) return
    callback()
    observer = new MutationObserver(callback)
    observer.observe(document.body, { childList: true, subtree: true })
  }

  function stopWatcher() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function init() {
    chrome.storage.sync.get('mi_enabled', function (r) {
      if (r.mi_enabled !== undefined) ENABLED = r.mi_enabled
      if (ENABLED) loadDataAndStart()
    })

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'sync') return
      if (changes.mi_enabled !== undefined) {
        ENABLED = changes.mi_enabled.newValue
        if (ENABLED) loadDataAndStart()
        else stopWatcher()
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
