import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import {
  ToggleSwitch,
  ToggleSwitchOption,
} from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ModalCloseButton } from '@lib/ui/modal/ModalCloseButton'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AddressBookListItem } from '../../../../../address-book/item'
import { useAssertWalletCore } from '../../../../../chain/providers/WalletCoreProvider'
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
  const walletCore = useAssertWalletCore()
  const options: Readonly<ToggleSwitchOption<AddressBookOption>[]> = [
    { label: t('address_book_saved'), value: 'saved' },
    { label: t('address_book_vault'), value: 'all' },
  ] as const

  const [addressBookSelectedOption, setAddressBookSelectedOption] =
    useState<AddressBookOption>('saved')

  const vaultsAndAddressForSelectedCoin = vaults.reduce<VaultAddressBookItem[]>(
    (acc, vault) => {
      const match = vault.coins.find(c => c.chain === coin.chain)

      if (match?.address) {
        acc.push({ name: vault.name, address: match.address })
      } else {
        const publicKey = getPublicKey({
          chain: coin.chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
        })

        const address = deriveAddress({
          chain: coin.chain,
          publicKey,
          walletCore,
        })
        acc.push({ name: vault.name, address })
      }
      return acc
    },
    []
  )

  const eligibleSavedItems = addressBookItems.filter(item => {
    if (isEvmChain(coin.chain)) {
      return isEvmChain(item.chain)
    }
    return item.chain === coin.chain
  })

  const savedEmptyState = (() => {
    if (addressBookItems.length === 0) {
      return {
        title: t('vault_settings_address_book_no_addresses_title'),
        description: t('vault_settings_address_book_no_addresses_description'),
      }
    }

    const chainLabel = isEvmChain(coin.chain) ? t('evm_chains') : coin.chain
    return {
      title: t('address_book_no_eligible_addresses_title', {
        chain: chainLabel,
      }),
      description: t('address_book_no_eligible_addresses_description'),
    }
  })()

  return (
    <ResponsiveModal
      isOpen
      modalProps={{
        withDefaultStructure: false,
      }}
      onClose={onClose}
    >
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
                eligibleSavedItems.length > 0 ? (
                  eligibleSavedItems.map(item => (
                    <AddressBookListItem
                      key={item.id}
                      onSelect={onSelect}
                      {...item}
                    />
                  ))
                ) : (
                  <SavedEmptyState gap={12} alignItems="center">
                    <Text
                      centerHorizontally
                      color="contrast"
                      size={16}
                      weight={500}
                    >
                      {savedEmptyState.title}
                    </Text>
                    <Text centerHorizontally color="shy" size={14} weight={500}>
                      {savedEmptyState.description}
                    </Text>
                  </SavedEmptyState>
                )
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
    </ResponsiveModal>
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
  width: 100%;
  background: ${getColor('foreground')};
  ${borderRadius.m};
  padding: 24px 20px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(368px, 100% - 32px);
  }
`

const OptionsContainer = styled(HStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 100%;
`

const StyledList = styled(List)`
  gap: 16px;
  flex: 1;
  background-image: none;
  flex-basis: 0;
  overflow: auto;
`

const SavedEmptyState = styled(VStack)`
  flex: 1;
  justify-content: center;
  max-width: 265px;
  margin: auto;
`

const OptionButton = styled(Button)`
  white-space: nowrap;
  flex: 1;
  height: 42px;
  padding: 12px 20px;
  font-size: 13px;
`
