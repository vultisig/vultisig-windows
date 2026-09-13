import { StationMigrationPage } from '@clients/extension/src/pages/station-migration/StationMigrationPage'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'

/** Station migration, reading where it was opened from out of the view state. */
export const StationMigrationView = () => {
  const [state] = useViewState<{ source?: 'setup' | 'settings' } | undefined>()

  return <StationMigrationPage source={state?.source} />
}
