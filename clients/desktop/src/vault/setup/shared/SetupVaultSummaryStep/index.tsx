import { useRive } from '@rive-app/react-canvas'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../lib/ui/buttons/Button'
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { Checkbox } from '../../../../lib/ui/inputs/checkbox/Checkbox'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { OnForwardProp } from '../../../../lib/ui/props'
import { Text } from '../../../../lib/ui/text'
import { SetupVaultType } from '../../type/SetupVaultType'
import { RiveWrapper, Wrapper } from './SetupVaultSummaryStep.styles'

type SetupVaultSummaryStepProps = OnForwardProp & {
  vaultType: SetupVaultType
  vaultShares?: number
}

export const SetupVaultSummaryStep: FC<SetupVaultSummaryStepProps> = ({
  vaultType,
  onForward,
  // TODO: @tony to ask how to use this value dynamically in the animation
  // vaultShares,
}) => {
  const { t } = useTranslation()
  const [isChecked, { toggle }] = useBoolean(false)
  const isFastVault = vaultType === 'fast'

  const { RiveComponent: FastVaultSetupSummary } = useRive({
    src: isFastVault
      ? '/assets/animations/fast-vault-summary/fastvault-summary.riv'
      : '/assets/animations/scure-vault-summary/securevault_summary.riv',
    autoplay: true,
  })

  return (
    <Wrapper gap={16}>
      <RiveWrapper>
        <FastVaultSetupSummary />
      </RiveWrapper>
      <VStack gap={16}>
        <HStack
          role="button"
          onClick={toggle}
          tabIndex={0}
          alignItems="center"
          gap={8}
        >
          <Checkbox onChange={() => {}} value={isChecked} />
          <Text color="contrast" weight={500} size={14}>
            {t('fastVaultSetup.summary.agreementText')}
          </Text>
        </HStack>
        <Button isDisabled={!isChecked} onClick={onForward}>
          {t('fastVaultSetup.summary.start_using_vault')}
        </Button>
      </VStack>
    </Wrapper>
  )
}
