declare module 'vite-plugin-node-stdlib-browser' {
  import { Plugin } from 'vite'
  const stdLibBrowser: () => Plugin
  export default stdLibBrowser
}
