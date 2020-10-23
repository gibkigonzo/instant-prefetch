# instant-prefetch

Extension of well known [InstantPage](https://instant.page/) library.
All kudos for (☞ﾟ∀ﾟ)☞ Alexandre Dieulot


```javascript
import { init } from 'instant-prefetch'

init(
  (element) => {
    // access to link url
    console.log(element.href)
    // We can also add data attributes to element and then retrive it here
    // For example:
    // <a data-instant-prefetch='{"url": "/women.html", "type": "category"}' >
    if ('instantDataPrefetch' in linkElement.dataset) {
      try {
        const data = JSON.parse(linkElement.dataset['instantDataPrefetch'])
        console.log(data) // do something
      } catch (err) {}
    }
  },
  // optional
  // same as global options added for https://instant.page/ to <body>
  {
    allowQueryString: false, // same as 'data-instant-allow-query-string' added to body in InstantPage https://instant.page/blacklist
    allowExternalLinks: false, // same as 'data-instant-allow-external-links' added to body in InstantPage https://instant.page/blacklist
    useWhitelist: false, // same as 'data-instant-allow-external-links' added to body in InstantPage https://instant.page/blacklist
    mousedownShortcut: false, // same as 'data-instant-mousedown-shortcut' added to body in InstantPage https://instant.page/intensity
    intensity = '', // 'data-instant-intensity' added to body in InstantPage https://instant.page/intensity
  }
)

// next call for `init` will only reload listeners and IntersectionObserver but list of triggered links will remain the same
```

See more information on the original website: https://instant.page/

## License

[MIT](/LICENSE) &copy; [gibkigonzo](https://github.com/gibkgigonzo).
