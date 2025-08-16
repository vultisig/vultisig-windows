import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { CustomToken } from '@core/ui/chain/coin/addCustomToken/CustomToken'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const AddCustomTokenPage = () => {
  const { t } = useTranslation()

  const walletCore = useAssertWalletCore()
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const [value, setValue] = useState('')

  const { getClipboardText } = useCore()

  return (
    <>
      <FlowPageHeader title={t('find_custom_token')} />
      <PageContent>
        <VStack gap={40}>
          <ActionInsideInteractiveElement
            render={({ actionSize }) => (
              <TextInput
                placeholder={t('enter_contract_address')}
                value={value}
                onValueChange={setValue}
                style={{
                  paddingRight: actionSize.width + textInputHorizontalPadding,
                }}
              />
            )}
            action={
              <IconButton
                onClick={async () => {
                  const { data } = await attempt(getClipboardText)

                  if (data) setValue(data)
                }}
              >
                <PasteIcon />
              </IconButton>
            }
            actionPlacerStyles={{
              bottom: (textInputHeight - iconButtonSize.md) / 2,
              right: textInputHorizontalPadding,
            }}
          />
          {value ? (
            isValidAddress({
              chain,
              address: value,
              walletCore,
            }) ? (
              <CustomToken id={value} />
            ) : (
              <Text>{t('invalid_token_address')}</Text>
            )
          ) : null}
        </VStack>
      </PageContent>
    </>
  )
}
