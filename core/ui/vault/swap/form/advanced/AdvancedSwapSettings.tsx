import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AdvancedSwapSettingsSheet } from './AdvancedSwapSettingsSheet'
import { defaultSlippage, SlippageValue } from './slippage'

export const AdvancedSwapSettings = () => {
  const { t } = useTranslation()
  const [isOpen, { set: open, unset: close }] = useBoolean(false)
  const [slippage, setSlippage] = useState<SlippageValue>(defaultSlippage)

  return (
    <>
      <Trigger onClick={open}>
        <Text size={14} color="shy" centerHorizontally>
          {t('advanced_settings')}
        </Text>
      </Trigger>
      {isOpen && (
        <AdvancedSwapSettingsSheet
          onClose={close}
          slippage={slippage}
          onSlippageChange={setSlippage}
        />
      )}
    </>
  )
}

const Trigger = styled(UnstyledButton)`
  align-self: center;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    opacity: 0.8;
  }
`
