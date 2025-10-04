import { Chain } from '@core/chain/Chain'
import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type SignMessageOverview = {
  chain: Chain
  message: string
  method: string
  signature?: string
}

export const DefaultOverview: FC<SignMessageOverview> = ({
  chain,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(chain)
  const isFinished = useMemo(() => !!signature, [signature])

  return (
    <>
      <Animation isVisible={isFinished} />
      <Sender />
      <Request address={address} method={method} />
      {isFinished ? (
        <Collapse title={t('signed_signature')}>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </Collapse>
      ) : (
        <Collapse title={t(`message`)}>
          <Text as="span" color="info" size={14} weight={500}>
            {message}
          </Text>
        </Collapse>
      )}
    </>
  )
}
