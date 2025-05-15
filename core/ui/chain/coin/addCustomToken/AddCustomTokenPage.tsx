import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton, iconButtonSizeRecord } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCore } from '../../../state/core'
import { useAssertWalletCore } from '../../providers/WalletCoreProvider'
import { CustomToken } from './CustomToken'

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
                icon={<PasteIcon />}
                onClick={async () => {
                  const { data } = await attempt(getClipboardText)

                  if (data) {
                    setValue(data)
                  }
                }}
              />
            }
            actionPlacerStyles={{
              right: textInputHorizontalPadding,
              bottom: (textInputHeight - iconButtonSizeRecord.m) / 2,
            }}
          />
          {value ? (
            isValidAddress({
              chain,
              address: value,
              walletCore,
            }) ? (
              <CustomToken address={value} />
            ) : (
              <Text>{t('invalid_token_address')}</Text>
            )
          ) : null}
        </VStack>
      </PageContent>
    </>
  )
}
