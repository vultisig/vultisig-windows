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
import { attempt } from '@lib/utils/attempt'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCore } from '../../../state/core'
import { CustomTokenResult } from './CustomTokenResult'

export const AddCustomTokenPage = () => {
  const { t } = useTranslation()

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
          {value && <CustomTokenResult value={value} />}
        </VStack>
      </PageContent>
    </>
  )
}
