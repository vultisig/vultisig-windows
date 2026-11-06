import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'

import { SettingsCard } from './SettingsCard'
import {
  SettingsItemTitleVariant,
  SettingsItemTitleVariantContext,
} from './settingsItemTitleVariant'

type SettingsSectionProps = ChildrenProp & {
  title?: ReactNode
  itemTitleVariant?: SettingsItemTitleVariant
}

/** An optional caption over a card of settings rows. */
export const SettingsSection = ({
  title,
  children,
  itemTitleVariant = 'footnote',
}: SettingsSectionProps) => (
  <VStack gap={12}>
    {title && (
      <Text color="shy" variant="caption">
        {title}
      </Text>
    )}
    <SettingsItemTitleVariantContext.Provider value={itemTitleVariant}>
      <SettingsCard>{children}</SettingsCard>
    </SettingsItemTitleVariantContext.Provider>
  </VStack>
)
