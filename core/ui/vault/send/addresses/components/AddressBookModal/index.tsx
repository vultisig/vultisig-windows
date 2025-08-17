import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import {
  ToggleSwitch,
  ToggleSwitchOption,
} from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Modal } from '@lib/ui/modal'
import { ModalCloseButton } from '@lib/ui/modal/ModalCloseButton'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AddressBookListItem } from '../../../../../address-book/item'
import { useAddressBookItems } from '../../../../../storage/addressBook'
import { useVaults } from '../../../../../storage/vaults'
import { useCurrentSendCoin } from '../../../state/sendCoin'
import { VaultAddressBookItem } from './VaultAddressBookItem'

type Props = {
  onSelect: (address: string) => void
} & OnCloseProp

type AddressBookOption = 'saved' | 'all'

export const AddressBookModal = ({ onSelect, onClose }: Props) => {
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()
  const addressBookItems = useAddressBookItems()
  const vaults = useVaults()

  const options: Readonly<ToggleSwitchOption<AddressBookOption>[]> = [
    { label: t('address_book_saved'), value: 'saved' },
    { label: t('address_book_vault'), value: 'all' },
  ] as const

  const [addressBookSelectedOption, setAddressBookSelectedOption] =
    useState<AddressBookOption>('saved')

  const vaultsAndAddressForSelectedCoin = useMemo(() => {
    return vaults.reduce<VaultAddressBookItem[]>((acc, vault) => {
      const match = vault.coins.find(c => c.chain === coin.chain)

      if (match?.address) {
        acc.push({ name: vault.name, address: match.address })
      }
      return acc
    }, [])
  }, [coin.chain, vaults])

  return (
    <Modal withDefaultStructure={false} onClose={onClose}>
      <ModalWrapper gap={16}>
        <HStack justifyContent="space-between" alignItems="center">
          <Title size={15}>{t('address_book')}</Title>
          <ModalCloseButton
            style={{
              color: 'hsl(215, 40%, 85%)',
              fontSize: 16,
            }}
            onClick={onClose}
          />
        </HStack>
        <VStack flexGrow gap={16}>
          <Divider />
          <ToggleSwitch
            style={{ backgroundColor: 'transparent' }}
            slots={{
              Container: OptionsContainer,
              OptionButton: ({ children, active, ...rest }) => (
                <OptionButton
                  {...rest}
                  disabled={false}
                  kind={active ? 'primary' : 'secondary'}
                >
                  {children}
                </OptionButton>
              ),
            }}
            value={addressBookSelectedOption}
            options={options}
            onChange={value => setAddressBookSelectedOption(value)}
          />
          <StyledList>
            <Match
              value={addressBookSelectedOption}
              saved={() =>
                addressBookItems
                  .filter(item => item.chain === coin.chain)
                  .map(item => (
                    <AddressBookListItem
                      key={item.id}
                      onSelect={onSelect}
                      {...item}
                    />
                  ))
              }
              all={() =>
                vaultsAndAddressForSelectedCoin.map((value, idx) => (
                  <VaultAddressBookItem
                    value={value}
                    key={idx}
                    onSelect={onSelect}
                  />
                ))
              }
            />
          </StyledList>
        </VStack>
      </ModalWrapper>
    </Modal>
  )
}

const Title = styled(Text)`
  // @tony: one off color, not added to the theme
  color: hsl(215, 40%, 85%);
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
`

const ModalWrapper = styled(VStack)`
  height: 500px;
  width: min(368px, 100% - 32px);
  background: ${getColor('background')};
  border: 1px solid ${getColor('mistExtra')};
  ${borderRadius.m};
  padding: 24px 20px;
`

const OptionsContainer = styled(HStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 100%;
`

const StyledList = styled(List)`
  background-color: transparent;
  gap: 16px;
  flex: 1;
  flex-basis: 0;
  overflow: auto;
`

const OptionButton = styled(Button)`
  white-space: nowrap;
  flex: 1;
  height: 42px;
  padding: 12px 20px;
  font-size: 13px;
`
