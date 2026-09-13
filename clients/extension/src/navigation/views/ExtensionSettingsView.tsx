import { ExtensionDeveloperOptions } from '@clients/extension/src/components/developer-options'
import { ExpandView } from '@clients/extension/src/components/expand-view'
import { Prioritize } from '@clients/extension/src/components/prioritize'
import { StationMigrationSettingsEntry } from '@clients/extension/src/components/settings/StationMigrationSettingsEntry'
import { SettingsPage } from '@core/ui/settings'

import { ManageSidePanel } from '../../components/side-panel/ManageSidePanel'

/** The shared settings page with the extension-only entries slotted in. */
export const ExtensionSettingsView = () => (
  <SettingsPage
    insiderOptions={<ExtensionDeveloperOptions />}
    prioritize={<Prioritize />}
    stationMigration={<StationMigrationSettingsEntry />}
    expandView={<ExpandView />}
    sidePanel={<ManageSidePanel />}
  />
)
