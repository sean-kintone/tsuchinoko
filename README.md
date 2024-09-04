# Kintone Chrome Extension Sample

It's a chrome extension manages your Kintone notifications.

This uses:
 - Svelte
 - Tailwind CSS
 - Flowbite components
 - Language Locales

## Install Steps

1. Clone the repo.
2. Run `npm install`
3. Run `npm run build` to build the extension.
4. Open up [Chrome Extension settings](chrome://extensions)
5. Enable Developer Mode in the Top Right
6. Click on **Load Unpacked** to load the extension.
7. Load the **public** folder that gets created when you build.
8. You should see a new extension installed!
9. Navigate

## Resources

| File worth looking at                          | Description                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| [/src](/src/)                                  | Src Folder containing all Code                     |
| [App.svelte](/src/App.svelte)                  | Main App content                                   |
| [/src/components](/src/components/)            | An example component for use in Svelte             |
| [background.ts](/src/background/background.ts) | Tells Chrome to open the extension as a side-panel |
| [/src/_locales](/src/_locales/)                | Language Locales for the Extension live here       |
| [manifest.json](/src/manifest.json)            | Extension settings etc for the browser             |
| [content.js](/src/content.js)                  | This script runs on notification pages.            |

## DISCLAIMER

This OSS is my own personal work and does not have any relationship with Cybozu Inc. or any other organization to which I belong.

このOSSは、私個人の著作物であり、サイボウズ株式会社、その他、私の所属する組織とは一切関係ありません。