// Reexport the native module. On web, it will be resolved to MobileTssModule.web.ts
// and on native platforms to MobileTssModule.ts
export * from './src/MobileTss.types'
export { default } from './src/MobileTssModule'
