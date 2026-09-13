import { ComponentType } from 'react'

/** Loads a view's module on demand and resolves to the component that renders it. */
export type ViewLoader = () => Promise<ComponentType<any>>

/**
 * A view registry whose entries are loaders instead of components. Pages
 * behind it only enter the bundle graph through dynamic imports, which is
 * what keeps them out of the entry chunk.
 */
export type ViewLoaders<T extends string = string> = Record<T, ViewLoader>
