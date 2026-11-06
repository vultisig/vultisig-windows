import { useCore } from '@core/ui/state/core'
import { DiscordOutlineIcon } from '@lib/ui/icons/DiscordOutlineIcon'
import { GithubOutlineIcon } from '@lib/ui/icons/GithubOutlineIcon'
import { Globe2Icon } from '@lib/ui/icons/Globe2Icon'
import { SparkleIcon } from '@lib/ui/icons/SparkleIcon'
import { XLogoIcon } from '@lib/ui/icons/XLogoIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  currentProductWebsiteUrl,
  discordReferralUrl,
  extensionStoreReviewsUrl,
  vultisigTwitterUrl,
  vultisigWindowsGithubUrl,
} from './constants'
import { SettingsCard } from './SettingsCard'
import { SettingsCommunityTile } from './SettingsCommunityTile'
import { SettingsItem } from './SettingsItem'
import { ShareAppSettingsItem } from './ShareAppSettingsItem'

/** Community links as tiles, then the rate and share rows. */
export const SettingsCommunity = () => {
  const { t } = useTranslation()
  const { openUrl, client } = useCore()

  return (
    <VStack gap={12}>
      <Text color="shy" variant="caption">
        {t('vultisig_community')}
      </Text>
      <VStack gap={6}>
        <HStack gap={6}>
          <SettingsCommunityTile
            icon={<XLogoIcon />}
            label={t('twitter')}
            onClick={() => openUrl(vultisigTwitterUrl)}
          />
          <SettingsCommunityTile
            icon={<DiscordOutlineIcon />}
            label={t('discord')}
            onClick={() => openUrl(discordReferralUrl)}
          />
          <SettingsCommunityTile
            icon={<GithubOutlineIcon />}
            label={t('github')}
            onClick={() => openUrl(vultisigWindowsGithubUrl)}
          />
          <SettingsCommunityTile
            icon={<Globe2Icon />}
            label={t('website')}
            onClick={() => openUrl(currentProductWebsiteUrl)}
          />
        </HStack>
        <SettingsCard>
          {client === 'extension' && (
            <SettingsItem
              icon={<SparkleIcon />}
              onClick={() => openUrl(extensionStoreReviewsUrl)}
              title={t('rate_app')}
            />
          )}
          <ShareAppSettingsItem />
        </SettingsCard>
      </VStack>
    </VStack>
  )
}
