/* Based on instant.page library made by Alexandre Dieulot */

let allowQueryString
let allowExternalLinks

let useWhitelist = false
let useMousedown = false
let useMousedownOnly = false
let useViewport = false

let delayOnHover = 65
let preloadCallback
let intersectionObserver

let mouseoverTimer
let lastTouchTimestamp

const prefetches = new Set()
const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111

function touchstartListener(event) {
  /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
    * must be assigned on touchstart to be measured on mouseover. */
  lastTouchTimestamp = window.performance.now()

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement)
}

function mouseoverListener(event) {
  if (window.performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  linkElement.addEventListener('mouseout', mouseoutListener, {passive: true})

  mouseoverTimer = setTimeout(() => {
    preload(linkElement)
    mouseoverTimer = undefined
  }, delayOnHover)
}

function mousedownListener(event) {
  const linkElement = event.target.closest('a')

  if (!isPreloadable(linkElement)) {
    return
  }

  preload(linkElement)
}

function mouseoutListener(event) {
  if (event.relatedTarget && event.target.closest('a') == event.relatedTarget.closest('a')) {
    return
  }

  if (mouseoverTimer) {
    clearTimeout(mouseoverTimer)
    mouseoverTimer = undefined
  }
}

function mousedownShortcutListener(event) {
  if (window.performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
    return
  }

  const linkElement = event.target.closest('a')

  if (event.which > 1 || event.metaKey || event.ctrlKey) {
    return
  }

  if (!linkElement) {
    return
  }

  linkElement.addEventListener('click', function (event) {
    if (event.detail == 1337) {
      return
    }

    event.preventDefault()
  }, {capture: true, passive: false, once: true})

  const customEvent = new window.MouseEvent('click', {view: window, bubbles: true, cancelable: false, detail: 1337})
  linkElement.dispatchEvent(customEvent)
}

function isPreloadable(linkElement) {
  if (!linkElement || !linkElement.href) {
    return
  }

  if (useWhitelist && !('instant' in linkElement.dataset)) {
    return
  }

  if (!allowExternalLinks && linkElement.origin != window.location.origin && !('instant' in linkElement.dataset)) {
    return
  }

  if (!['http:', 'https:'].includes(linkElement.protocol)) {
    return
  }

  if (linkElement.protocol == 'http:' && window.location.protocol == 'https:') {
    return
  }

  if (!allowQueryString && linkElement.search && !('instant' in linkElement.dataset)) {
    return
  }

  if (linkElement.hash && linkElement.pathname + linkElement.search == window.location.pathname + window.location.search) {
    return
  }

  if ('noInstant' in linkElement.dataset) {
    return
  }

  return true
}

function preload(linkElement) {
  if (prefetches.has(linkElement.href)) {
    return
  }

  if (preloadCallback) {
    preloadCallback(linkElement)
  }

  prefetches.add(linkElement.href)
}

function startIntersection() {
  if (useViewport) {
    let triggeringFunction
    if (window.requestIdleCallback) {
      triggeringFunction = (callback) => {
        window.requestIdleCallback(callback, {
          timeout: 1500,
        })
      }
    }
    else {
      triggeringFunction = (callback) => {
        callback()
      }
    }

    triggeringFunction(() => {
      intersectionObserver = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const linkElement = entry.target
            intersectionObserver.unobserve(linkElement)
            preload(linkElement)
          }
        })
      })

      document.querySelectorAll('a').forEach((linkElement) => {
        if (isPreloadable(linkElement)) {
          intersectionObserver.observe(linkElement)
        }
      })
    })
  }
}

/* eslint-disable no-unused-vars */
export function init (_preload = (linkElement) => {}, {
  allowQueryString: _allowQueryString = false,
  allowExternalLinks: _allowExternalLinks = false,
  useWhitelist: _useWhitelist = false,
  mousedownShortcut = false,
  intensity = '',
} = {}) {
  if (!window) return

  const prefetchElement = document.createElement('link')
  const isSupported = prefetchElement.relList && prefetchElement.relList.supports && prefetchElement.relList.supports('prefetch')
                      && window.IntersectionObserver && 'isIntersecting' in window.IntersectionObserverEntry.prototype

  allowQueryString = _allowQueryString
  allowExternalLinks = _allowExternalLinks
  useWhitelist = _useWhitelist
  useMousedown = false
  useMousedownOnly = false
  useViewport = false

  preloadCallback = _preload

  if (intensity) {
    if (intensity.substr(0, 'mousedown'.length) == 'mousedown') {
      useMousedown = true
      if (intensity == 'mousedown-only') {
        useMousedownOnly = true
      }
    }
    else if (intensity.substr(0, 'viewport'.length) == 'viewport') {
      if (!(window.navigator.connection && (window.navigator.connection.saveData || (window.navigator.connection.effectiveType && window.navigator.connection.effectiveType.includes('2g'))))) {
        if (intensity == "viewport") {
          /* Biggest iPhone resolution (which we want): 414 × 896 = 370944
          * Small 7" tablet resolution (which we don’t want): 600 × 1024 = 614400
          * Note that the viewport (which we check here) is smaller than the resolution due to the UI’s chrome */
          if (document.documentElement.clientWidth * document.documentElement.clientHeight < 450000) {
            useViewport = true
          }
        }
        else if (intensity == "viewport-all") {
          useViewport = true
        }
      }
    }
    else {
      const milliseconds = parseInt(intensity)
      if (!isNaN(milliseconds)) {
        delayOnHover = milliseconds
      }
    }
  }
  if (isSupported) {
    const eventListenersOptions = {
      capture: true,
      passive: true,
    }

    if (!useMousedownOnly) {
      document.removeEventListener('touchstart', touchstartListener, eventListenersOptions)
      document.addEventListener('touchstart', touchstartListener, eventListenersOptions)
    }

    if (!useMousedown) {
      document.removeEventListener('mouseover', mouseoverListener, eventListenersOptions)
      document.addEventListener('mouseover', mouseoverListener, eventListenersOptions)
    } else if (!mousedownShortcut) {
      document.removeEventListener('mousedown', mousedownListener, eventListenersOptions)
      document.addEventListener('mousedown', mousedownListener, eventListenersOptions)
    }

    if (mousedownShortcut) {
      document.removeEventListener('mousedown', mousedownShortcutListener, eventListenersOptions)
      document.addEventListener('mousedown', mousedownShortcutListener, eventListenersOptions)
    }

    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }
    startIntersection()
  }
}
