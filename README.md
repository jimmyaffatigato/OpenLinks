# <img alt="OpenLinks" src="https://raw.githubusercontent.com/jimmyaffatigato/OpenLinks/default/icons/links-icon-48.png" width="32" /> OpenLinks

⛓️ OpenLinks is a Firefox extension for opening a lot of links at once ⛓️  
Based on [an idea](https://www.reddit.com/r/SomebodyMakeThis/comments/hfjgew/smt_selective_mass_link_opener_for_firefox/) by [/u/ConsolesQuiteAnnoyMe](https://www.reddit.com/user/ConsolesQuiteAnnoyMe).

- Lists all of the links on a page.
- Applies a filter to the list.
- Opens the entire list in tabs.

## Installation

Click "Add to Firefox" at https://addons.mozilla.org/en-US/firefox/addon/openlinks/

## Instructions

Click the <img alt="OpenLinks" src="https://raw.githubusercontent.com/jimmyaffatigato/OpenLinks/default/icons/links-icon-48.png" width="16" /> OpenLinks icon in your browser's toolbar. The resulting popup window will list all of the links in the active tab. This is often A LOT of links. Use the filter to avoid potentially opening hundreds of tabs at once.

### Filter

When "Use Regex" is unchecked, the filter matches each link that contains the input string. When "Use Regex" is checked, the filter's input will be interpreted as a regular expression using Firefox's built-in [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) object.

The "Ignore Case" checkbox determines whether or not the search should match case. The case of the links in the resulting list is not affected.

### Opening Links

Click "OpenLinks" to open **every** link in the list in new tabs. Your browser will probably crash if you try to open too many at once. So don't do that. 🤷

---

## Contributing

This is the first browser extension I have written. It's very much a learning experience for me, so feedback is appreciated.

- [Leave a review](https://addons.mozilla.org/en-US/firefox/addon/openlinks/) with Mozilla.
- [Open an issue](https://github.com/jimmyaffatigato/OpenLinks/issues) to report bugs or suggest features.
- [Open a pull request](https://github.com/jimmyaffatigato/OpenLinks/pulls) to fix bugs or submit translations.

---

## Build

### Linux

Requires `jq` and `tsc`.

With NPM:

`npm run build`

Without NPM:

`bash build/build.sh`

This script will:

- Compile `.js` files from `.ts` source.
- Copy add-on files into `./build/dist`.
- Package the contents of `./build/dist` into an `.xpi` file using the name and version from `./src/manifest.json`.

Note: Firefox will reject the created file because it is not signed by Mozilla. Experimental builds can be loaded as a [temporary add-on](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) in `about:debugging#/runtime/this-firefox`.

### Windows

I haven't tried building this on Windows, but the Linux process _might_ work in Powershell. Presumably, `jq` and `tsc` would need to be accessible in PATH.

---

## TODO

- Add a warning when opening way too many links.
- Cross platform build.
- Chrome version.
