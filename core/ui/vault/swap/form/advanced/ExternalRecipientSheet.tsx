import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { useCore } from '@core/ui/state/core'
import { AddressBookModalContent } from '@core/ui/vault/send/addresses/components/AddressBookModal'
import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AdvancedSheet } from './AdvancedSheet'
import { AddressBookIcon } from './icons/AddressBookIcon'
import { PasteAddressIcon } from './icons/PasteAddressIcon'
import { ScanQrIcon } from './icons/ScanQrIcon'
import { SheetBackIcon } from './icons/SheetBackIcon'
import { SheetInfoIcon } from './icons/SheetInfoIcon'

type ExternalRecipientSheetProps = OnCloseProp & {
  value: string
  onChange: (value: string) => void
}

type View = 'default' | 'scanner' | 'addressBook'

export const ExternalRecipientSheet = ({
  value,
  onChange,
  onClose,
}: ExternalRecipientSheetProps) => {
  const { t } = useTranslation()
  const { getClipboardText } = useCore()
  const [toCoin] = useSwapToCoin()
  const [view, setView] = useState<View>('default')
  const [draft, setDraft] = useState(value)

  const apply = () => {
    onChange(draft)
    onClose()
  }

  const handlePaste = async () => {
    const result = await attempt(getClipboardText)
    if ('data' in result && result.data) {
      setDraft(result.data.trim())
    }
  }

  return (
    <AdvancedSheet
      title={t('use_external_recipient')}
      onClose={onClose}
      onConfirm={apply}
      leftIcon={<SheetBackIcon />}
    >
      <VStack gap={8}>
        <HStack alignItems="center" gap={6}>
          <Text size={14} weight={500} color="shy">
            {t('send_to_different_address')}
          </Text>
          <IconWrapper size={16} color="textShy">
            <SheetInfoIcon />
          </IconWrapper>
        </HStack>
        <AddressInput
          placeholder={t('enter_address_here')}
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <HStack gap={8}>
          <ActionButton onClick={handlePaste}>
            <IconWrapper size={20}>
              <PasteAddressIcon />
            </IconWrapper>
          </ActionButton>
          <ActionButton onClick={() => setView('scanner')}>
            <IconWrapper size={20} color="text">
              <ScanQrIcon />
            </IconWrapper>
          </ActionButton>
          <ActionButton onClick={() => setView('addressBook')}>
            <IconWrapper size={20} color="text">
              <AddressBookIcon />
            </IconWrapper>
          </ActionButton>
        </HStack>
      </VStack>
      {view === 'scanner' && (
        <ResponsiveModal
          isOpen
          onClose={() => setView('default')}
          modalProps={{ withDefaultStructure: false }}
        >
          <ScannerOverlay>
            <PageHeader
              hasBorder
              title={t('scan_qr')}
              primaryControls={
                <PageHeaderBackButton onClick={() => setView('default')} />
              }
            />
            <ScanQrView
              onFinish={scanned => {
                setDraft(scanned.trim())
                setView('default')
              }}
            />
          </ScannerOverlay>
        </ResponsiveModal>
      )}
      {view === 'addressBook' && (
        <AddressBookModalContent
          coin={toCoin}
          onClose={() => setView('default')}
          onSelect={selected => {
            setDraft(selected)
            setView('default')
          }}
        />
      )}
    </AdvancedSheet>
  )
}

const AddressInput = styled.input`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  background: ${getColor('background')};
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: ${getColor('text')};
  font-size: 14px;
  font-weight: 500;
  outline: none;

  &::placeholder {
    color: ${getColor('textShy')};
  }

  &:focus {
    border-color: ${getColor('foregroundSuper')};
  }
`

const ActionButton = styled.button`
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const ScannerOverlay = styled(VStack)`
  width: 100%;
  height: 70vh;
  background: ${getColor('background')};
  overflow: hidden;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(420px, 100vw);
  }
`
