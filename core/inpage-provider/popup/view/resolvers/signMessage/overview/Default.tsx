import { Animation } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Animation'
import { Collapse } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Collapse'
import { Request } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Request'
import { Sender } from '@core/inpage-provider/popup/view/resolvers/signMessage/components/Sender'
import { usePopupContext } from '@core/inpage-provider/popup/view/state/context'
import { Text } from '@lib/ui/text'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export type SignMessageOverview = {
  address: string
  message: string
  method: string
  signature?: string
}

export const DefaultOverview: FC<SignMessageOverview> = ({
  address,
  message,
  method,
  signature,
}) => {
  const { t } = useTranslation()
  const { requestFavicon, requestOrigin } = usePopupContext<'signMessage'>()
  const isFinished = useMemo(() => !!signature, [signature])

  const formattedMessage = useMemo(() => {
    try {
      const parsed = JSON.parse(message)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return null
    }
  }, [message])

  return (
    <>
      {isFinished && <Animation />}
      <Sender favicon={requestFavicon} origin={requestOrigin} />
      <Request address={address} method={method} />
      {isFinished ? (
        <Collapse title={t('signed_signature')}>
          <Text as="span" color="info" size={14} weight={500}>
            {signature}
          </Text>
        </Collapse>
      ) : (
        <Collapse title={t(`message`)}>
          {formattedMessage ? (
            <Text color="info" family="mono" size={14} weight={500}>
              <pre style={{ width: '100%' }}>
                <code
                  style={{
                    display: 'block',
                    overflowX: 'auto',
                    width: '100%',
                  }}
                >
                  {formattedMessage}
                </code>
              </pre>
            </Text>
          ) : (
            <Text as="span" color="info" size={14} weight={500}>
              {message}
            </Text>
          )}
        </Collapse>
      )}
    </>
  )
}
