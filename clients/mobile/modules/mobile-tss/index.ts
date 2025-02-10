// Reexport the native module. On web, it will be resolved to MobileTssModule.web.ts
// and on native platforms to MobileTssModule.ts
export { default } from './src/MobileTssModule';
export { default as MobileTssView } from './src/MobileTssView';
export * from  './src/MobileTss.types';
