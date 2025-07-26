import { Match } from '@lib/ui/base/Match'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
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

export const AddressBookModal = ({ onSelect, onClose }: Props) => {
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()
  const addressBookItems = useAddressBookItems()
  const vaults = useVaults()

  const options = [
    { label: t('address_book_saved'), value: 'saved' },
    { label: t('address_book_vault'), value: 'all' },
  ] as const

  const [addressBookSelectedOption, setAddressBookSelectedOption] =
    useState<(typeof options)[number]['value']>('saved')

  const vaultsAndAddressForSelectedCoin = useMemo(() => {
    return vaults.reduce<VaultAddressBookItem[]>((acc, vault) => {
      const match = vault.coins.find(
        c => c.chain === coin.chain && (coin.id ? c.id === coin.id : !c.id)
      )

      if (match?.address) {
        acc.push({ name: vault.name, address: match.address })
      }
      return acc
    }, [])
  }, [coin.chain, coin.id, vaults])

  return (
    <Modal
      onClose={onClose}
      title={<Title size={15}>{t('address_book')}</Title>}
      closeButtonStyle={{
        color: 'hsl(215, 40%, 85%)',
      }}
    >
      <VStack gap={16}>
        <Divider />
        <ToggleSwitch
          slots={{
            OptionButton: () => <></>,
          }}
          value={addressBookSelectedOption}
          options={options}
          onChange={value => setAddressBookSelectedOption(value)}
        />
        <List>
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
        </List>
      </VStack>
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
