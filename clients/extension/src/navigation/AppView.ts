import { CoreView } from '@core/ui/navigation/CoreView'

export type AppView = CoreView | { id: 'onboarding' } | { id: 'connectedDapps' }

export type AppViewId = AppView['id']
