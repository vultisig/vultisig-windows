import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { EmailConfirmation } from '@core/ui/vault/backup/fast'
import { InitiateVaultShareBackup } from '@core/ui/vault/backup/InitiateVaultShareBackup'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { InitiateFastVaultBackup } from './InitiateFastVaultBackup'
import { VaultCreatedSuccessScreen } from './VaultCreatedSuccessScreen'

const steps = [
  'backupOverview',
  'emailVerification',
  'saveVault',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

type BackupFastVaultProps = OnFinishProp &
  OnBackProp & {
    password: string
    onChangeEmailAndRestart?: () => void
    onVaultSaveError?: (error: Error) => void | Promise<void>
    onVaultSaved?: (vault: Vault) => void | Promise<void>
  }

/**
 * Post-keygen backup flow for a vault that has the server as a co-signer. The
 * share is encrypted with the vault password when this device knows it,
 * otherwise the user is asked to choose a backup password.
 */
export const BackupFastVault = ({
  onBack,
  password,
  onChangeEmailAndRestart,
  onVaultSaveError,
  onVaultSaved,
}: BackupFastVaultProps) => {
  const { t } = useTranslation()

  const { step, setStep, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const vault = useCurrentVault()
  const vaultCreationInput = useVaultCreationInput()
  const email =
    vaultCreationInput && 'fast' in vaultCreationInput
      ? vaultCreationInput.fast.email
      : ''

  return (
    <Match
      value={step}
      backupOverview={() => (
        <BackupOverviewScreen
          userDeviceCount={vault.signers.filter(s => !isServer(s)).length}
          onFinish={toNextStep}
          onBack={onBack}
        />
      )}
      saveVault={() => (
        <SaveVaultStep
          value={vault}
          title={t('creating_vault')}
          onFinish={toNextStep}
          onBack={onBack}
          onVaultSaveError={onVaultSaveError}
          onVaultSaved={onVaultSaved}
        />
      )}
      emailVerification={() => (
        <EmailConfirmation
          onFinish={toNextStep}
          onBack={toPreviousStep}
          email={email}
          onChangeEmailAndRestart={onChangeEmailAndRestart}
        />
      )}
      backupPage={() =>
        password ? (
          <InitiateFastVaultBackup
            password={password}
            onFinish={toNextStep}
            onBack={() => setStep('backupOverview')}
          />
        ) : (
          // This device joined someone else's keygen, so it never saw the vault
          // password and cannot encrypt the share with it — let the user pick.
          <InitiateVaultShareBackup
            onFinish={toNextStep}
            onBack={() => setStep('backupOverview')}
          />
        )
      }
      backupSuccessfulSlideshow={() => <VaultCreatedSuccessScreen />}
    />
  )
}
