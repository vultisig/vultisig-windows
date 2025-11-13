import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { queryUrl } from '@lib/utils/query/queryUrl'
import base58 from 'bs58'

type TriggerContractResponse = {
  energy_used?: number
  energy_penalty?: number
}

type GetTrc20TransferFeeInput = {
  coin: AccountCoinKey
  amount: bigint
  receiver: string
}

function base58ToHex(address: string): string {
  const decoded = base58.decode(address)
  const addressBytes = decoded.slice(0, -4)
  return Buffer.from(addressBytes).toString('hex')
}

function buildTrc20TransferParameter(
  recipientBaseHex: string,
  amount: bigint
): string {
  const cleanRecipientHex = recipientBaseHex.replace(/^0x/, '')
  const addressWithoutPrefix = cleanRecipientHex.slice(2)
  const paddedAddressHex = addressWithoutPrefix.padStart(64, '0')
  const amountHex = amount.toString(16)
  const paddedAmountHex = amountHex.padStart(64, '0')
  return paddedAddressHex + paddedAmountHex
}

export const getTrc20TransferFee = async ({
  coin,
  receiver,
  amount,
}: GetTrc20TransferFeeInput): Promise<bigint> => {
  const recipientAddressHex = base58ToHex(receiver)
  const functionSelector = 'transfer(address,uint256)'

  const parameter = buildTrc20TransferParameter(recipientAddressHex, amount)

  const url = 'https://api.trongrid.io/walletsolidity/triggerconstantcontract'

  const responseData = await queryUrl<TriggerContractResponse>(url, {
    headers: {
      accept: 'application/json',
    },
    body: {
      owner_address: coin.address,
      contract_address: coin.id,
      function_selector: functionSelector,
      parameter: parameter,
      visible: true,
    },
  })

  const energyUsed = responseData.energy_used ?? 0
  const energyPenalty = responseData.energy_penalty ?? 0
  const totalEnergy = BigInt(energyUsed) + BigInt(energyPenalty)
  const totalSun = totalEnergy * 280n

  return totalSun
}
