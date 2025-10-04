import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { SignMessageOverview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview/Default'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Text } from '@lib/ui/text'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const ConnectOverview: FC<SignMessageOverview> = ({
  chain,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(chain)
  const isFinished = useMemo(() => !!signature, [signature])

  const displayMessage = useMemo(() => {
    const parsed = JSON.parse(message)

    return parsed.message as string
  }, [message])

  const parsedMessage = useMemo(() => {
    const parsed = JSON.parse(message)

    return JSON.stringify(parsed, null, 2)
  }, [message])

  return (
    <>
      <Animation isVisible={isFinished} />
      <Sender isValidated />
      <Request address={address} message={displayMessage} method={method} />
      {isFinished ? (
        <Collapse title={t('signed_signature')}>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </Collapse>
      ) : (
        <Collapse title={t(`message`)}>
          <Text color="info" family="mono" size={14} weight={500}>
            <pre style={{ width: '100%' }}>
              <code
                style={{ display: 'block', overflowX: 'auto', width: '100%' }}
              >
                {parsedMessage}
              </code>
            </pre>
          </Text>
        </Collapse>
      )}
    </>
  )
}
