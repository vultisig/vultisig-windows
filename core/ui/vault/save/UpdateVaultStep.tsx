import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { encryptVaultAllKeyShares } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCreateCoinsMutation } from '@core/ui/storage/coins'
import { useHasPasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnBackProp, OnFinishProp, TitleProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type UpdateVaultStepProps = ValueProp<Vault> &
  OnFinishProp &
  TitleProp &
  OnBackProp & {
    chainsToAdd: Chain[]
  }

export const UpdateVaultStep = ({
  value: vault,
  chainsToAdd,
  onFinish,
  title,
  onBack,
}: UpdateVaultStepProps) => {
  const { t } = useTranslation()
  const walletCore = useAssertWalletCore()
  const hasPasscodeEncryption = useHasPasscodeEncryption()
  const [passcode] = usePasscode()
  const { mutateAsync: createCoins } = useCreateCoinsMutation()

  const { mutate, ...mutationState } = useUpdateVaultMutation({
    onSuccess: onFinish,
  })

  useEffect(() => {
    const run = async () => {
      let fields: Partial<Vault> = {
        chainPublicKeys: vault.chainPublicKeys,
        chainKeyShares: vault.chainKeyShares,
        saplingExtras: vault.saplingExtras,
      }

      if (hasPasscodeEncryption) {
        const key = shouldBePresent(passcode)
        const encrypted = encryptVaultAllKeyShares({
          keyShares: vault.keyShares,
          chainKeyShares: vault.chainKeyShares,
          keyShareMldsa: vault.keyShareMldsa,
          key,
        })
        fields = {
          ...fields,
          chainKeyShares: encrypted.chainKeyShares,
        }
      }

      const vaultId = getVaultId(vault)

      mutate({ vaultId, fields })

      const coins = await Promise.all(
        chainsToAdd.map(async chain => {
          const publicKey = getPublicKey({
            chain,
            walletCore,
            hexChainCode: vault.hexChainCode,
            publicKeys: vault.publicKeys,
            chainPublicKeys: vault.chainPublicKeys,
          })
          const address = deriveAddress({ chain, publicKey, walletCore })
          return { ...chainFeeCoin[chain], address }
        })
      )

      await createCoins({ vaultId, coins })
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <FlowPageHeader title={title} />
      <MatchQuery
        value={mutationState}
        pending={() => <FlowPendingPageContent title={t('saving_vault')} />}
        success={() => null}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_save_vault')}
            error={error}
            action={<Button onClick={onBack}>{t('back')}</Button>}
          />
        )}
      />
    </>
  )
}
