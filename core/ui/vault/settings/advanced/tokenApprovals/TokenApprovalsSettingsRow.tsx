import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { ShieldCheckIcon } from '@lib/ui/icons/ShieldCheckIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

import {
  DescriptionText,
  ListItemIconWrapper,
} from '../../vaultSettingsListStyles'

/**
 * Token Approvals entry on the Advanced screen. Extension only for now; the
 * desktop app keeps its current Advanced list.
 */
export const TokenApprovalsSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { client } = useCore()

  if (client !== 'extension') return null

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <ShieldCheckIcon />
        </ListItemIconWrapper>
      }
      description={
        <DescriptionText>{t('token_approvals_description')}</DescriptionText>
      }
      onClick={() => navigate({ id: 'tokenApprovals' })}
      title={t('token_approvals')}
      hoverable
      showArrow
    />
  )
}
