import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW, WalletCore } from '@trustwallet/wallet-core'

interface AddressTableLookup {
  accountKey: string
  writableIndexes: number[]
  readonlyIndexes: number[]
}

export async function getParsedSolanaSwap(
  walletCore: WalletCore,
  inputTx: Uint8Array
) {
  let fromAddress = ''
  const txInputDataArray = Object.values(inputTx)
  const txInputDataBuffer = new Uint8Array(txInputDataArray as any)

  const buffer = Buffer.from(txInputDataBuffer)
  const encodedTx = walletCore?.TransactionDecoder.decode(
    walletCore.CoinType.solana,
    buffer
  )

  const decodedTx = TW.Solana.Proto.DecodingTransactionOutput.decode(encodedTx!)
  console.log('Decoded Output:', decodedTx)
  const tx = decodedTx.transaction!.v0!

  console.log('account Key', tx.accountKeys)
  let staticAccountsPubkey = tx.accountKeys?.map(key => new PublicKey(key))
  const resolvedAddresses = await resolveAddressTableKeys(
    tx.addressTableLookups! as AddressTableLookup[]
  )
  staticAccountsPubkey = staticAccountsPubkey?.concat(resolvedAddresses)
  console.log('resolved addresses:', resolvedAddresses)
  console.log('staticAccountsPubkey:', staticAccountsPubkey)
  const connection = new Connection(chainRpcUrl.Solana)
  const accountInfos = await connection.getMultipleParsedAccounts(
    staticAccountsPubkey!
  )
  console.log('accountInfos:', accountInfos)
  console.log(
    'strings:',
    staticAccountsPubkey?.map(account => account.toString())
  )

  const filteredAccounts = accountInfos.value.filter(
    info =>
      info?.data &&
      (info.data as any).program === 'spl-token' &&
      (info?.data as any).parsed.info.mint
  )
  console.log('filtered:', filteredAccounts)
  const filterSet = new Set(
    filteredAccounts.map(account => (account?.data as any).parsed.info.mint)
  )
  console.log('filterSet:', filterSet)

  return
}

async function resolveAddressTableKeys(
  lookups: AddressTableLookup[]
): Promise<PublicKey[]> {
  const allResolvedKeys: PublicKey[] = []
  const connection = new Connection(chainRpcUrl.Solana)
  for (const lookup of lookups) {
    const tableAccountResult = await connection.getAddressLookupTable(
      new PublicKey(lookup.accountKey)
    )

    if (!tableAccountResult.value) continue

    const table = tableAccountResult.value
    const resolved = [
      ...lookup.writableIndexes.map(idx => table.state.addresses[idx]),
      ...lookup.readonlyIndexes.map(idx => table.state.addresses[idx]),
    ]

    allResolvedKeys.push(...resolved)
  }

  return allResolvedKeys
}
