import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { VStack } from '@lib/ui/layout/Stack'
import { ReactNode } from 'react'

type ServerBackupFieldHeadingProps = {
  title: ReactNode
  description: ReactNode
}

/** The centered heading and helper line above an open Server Backup field. */
export const ServerBackupFieldHeading = ({
  title,
  description,
}: ServerBackupFieldHeadingProps) => (
  <VStack alignItems="center" gap={12}>
    <SettingsBaselineText
      centerHorizontally
      color="regular"
      height={24 / 22}
      letterSpacing={-0.36}
      size={22}
      weight={500}
    >
      {title}
    </SettingsBaselineText>
    <SettingsBaselineText
      centerHorizontally
      color="shy"
      height={20 / 14}
      size={14}
      weight={500}
    >
      {description}
    </SettingsBaselineText>
  </VStack>
)
