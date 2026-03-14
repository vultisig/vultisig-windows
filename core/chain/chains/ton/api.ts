import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { tonAddressToRaw } from './address'

const tonApiUrl = `${rootApiUrl}/ton`

type JettonWalletResponse = {
  jetton_wallets: Array<{
    address: string
    jetton: string
    balance: string
  }>
  address_book: Record<
    string,
    {
      user_friendly: string
    }
  >
}

type GetJettonWalletInput = {
  ownerAddress: string
  jettonMasterAddress: string
}

/** Builds the toncenter v3 jetton wallets query URL, converting addresses to raw format. */
const getJettonWalletsUrl = ({
  ownerAddress,
  jettonMasterAddress,
}: GetJettonWalletInput): string => {
  const rawOwner = tonAddressToRaw(ownerAddress)
  const rawMaster = tonAddressToRaw(jettonMasterAddress)

  return `${tonApiUrl}/v3/jetton/wallets?owner_address=${rawOwner}&jetton_address=${rawMaster}`
}

/** Resolves the user-friendly jetton wallet address for a given owner and jetton master. */
export const getJettonWalletAddress = async (
  input: GetJettonWalletInput
): Promise<string> => {
  const response = await queryUrl<JettonWalletResponse>(
    getJettonWalletsUrl(input)
  )

  const jettonAddress = response.jetton_wallets[0]?.address
  if (!jettonAddress) {
    throw new Error('No jetton wallet found')
  }

  const addressEntry = response.address_book[jettonAddress]
  return addressEntry?.user_friendly || jettonAddress
}

/** Fetches the balance of a specific jetton for a given owner address. */
export const getJettonBalance = async (
  input: GetJettonWalletInput
): Promise<bigint> => {
  const response = await queryUrl<JettonWalletResponse>(
    getJettonWalletsUrl(input)
  )

  const balance = response.jetton_wallets[0]?.balance
  return BigInt(balance ?? 0)
}

type AddressInformationResponse = {
  balance: string
  status: string
}

export const getTonWalletState = async (address: string): Promise<string> => {
  const url = `${tonApiUrl}/v3/addressInformation?address=${address}&use_v2=false`
  const response = await queryUrl<AddressInformationResponse>(url)

  return response.status
}
