import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

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

export const getJettonWalletAddress = async ({
  ownerAddress,
  jettonMasterAddress,
}: {
  ownerAddress: string
  jettonMasterAddress: string
}): Promise<string> => {
  const url = `${tonApiUrl}/v3/jetton/wallets?owner_address=${ownerAddress}&jetton_master_address=${jettonMasterAddress}`
  const response = await queryUrl<JettonWalletResponse>(url)

  const jettonAddress = response.jetton_wallets[0]?.address
  if (!jettonAddress) {
    throw new Error('No jetton wallet found')
  }

  const addressEntry = response.address_book[jettonAddress]
  return addressEntry?.user_friendly || jettonAddress
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
