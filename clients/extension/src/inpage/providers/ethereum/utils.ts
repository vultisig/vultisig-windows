import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { EvmChain } from '@core/chain/Chain'
import { getEvmChainByChainId } from '@core/chain/chains/evm/chainInfo'
import { callBackground } from '@core/inpage-provider/background'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { attempt } from '@lib/utils/attempt'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { Signature } from 'ethers'

export const processSignature = (signature: string) => {
  let result = Signature.from(ensureHexPrefix(signature))

  if (result.v < 27) {
    result = Signature.from({
      r: result.r,
      s: result.s,
      v: result.v + 27,
    })
  }

  return ensureHexPrefix(result.serialized)
}

export const getChain = async () => {
  const chain = await callBackground({
    getAppChain: { chainKind: 'evm' },
  })
  return chain as EvmChain
}

export const switchChainHandler = async ([{ chainId }]: [
  { chainId: string },
]) => {
  const chain = getEvmChainByChainId(chainId)
  if (!chain) {
    throw new EIP1193Error('UnrecognizedChain')
  }

  const { error } = await attempt(async () =>
    callBackground({ setAppChain: { evm: chain } })
  )
  if (error) {
    if (error === BackgroundError.Unauthorized) {
      await callBackground({ setVaultChain: { evm: chain } })
    } else {
      throw error
    }
  }

  return null
}

