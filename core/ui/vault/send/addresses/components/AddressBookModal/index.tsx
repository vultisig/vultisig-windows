import { Match } from '@lib/ui/base/Match'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
      const coinAddress = vault.coins.find(c => c.id === coin.id)?.address
      if (coinAddress) {
        acc.push({ name: vault.name, address: coinAddress })
      }
      return acc
    }, [])
  }, [coin.id, vaults])

  return (
    <Modal onClose={onClose} title={t('address_book')}>
      <VStack gap={8}>
        <ToggleSwitch
          options={options}
          selected={addressBookSelectedOption}
          onChange={setAddressBookSelectedOption}
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
