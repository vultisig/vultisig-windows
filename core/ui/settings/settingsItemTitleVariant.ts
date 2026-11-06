import { createContext } from 'react'

/** Title style of the rows in a settings card; Advanced uses the larger one. */
export type SettingsItemTitleVariant = 'footnote' | 'subtitle'

export const SettingsItemTitleVariantContext =
  createContext<SettingsItemTitleVariant>('footnote')
