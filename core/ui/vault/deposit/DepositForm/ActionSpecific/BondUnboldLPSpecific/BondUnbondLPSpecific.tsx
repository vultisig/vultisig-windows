import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { MayaChainPool } from '../../../types/mayaChain'
import { AssetRequiredLabel, Container } from '../../DepositForm.styled'
import { MayaChainAssetExplorer } from './MayaChainAssetExplorer'

type BondUnbondLPSpecificProps = {
  assets: MayaChainPool[]
  selectedAsset?: string
}

export const BondUnbondLPSpecific = ({
  assets,
  selectedAsset,
}: BondUnbondLPSpecificProps) => {
  const { t } = useTranslation()
  const [{ setValue, watch }] = useDepositFormHandlers()

  return (
    assets.length > 0 && (
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {selectedAsset || t('asset')}
              </Text>
              {!selectedAsset && (
                <AssetRequiredLabel as="span" color="danger" size={14}>
                  *
                </AssetRequiredLabel>
              )}
            </HStack>
            <IconWrapper style={{ fontSize: 20 }}>
              <ChevronRightIcon />
            </IconWrapper>
          </Container>
        )}
        renderContent={({ onClose }) => (
          <MayaChainAssetExplorer
            onClose={onClose}
            activeOption={watch('bondableAsset')}
            onOptionClick={selectedAsset => {
              setValue('bondableAsset', selectedAsset, {
                shouldValidate: true,
              })
              onClose()
            }}
            options={assets}
          />
        )}
      />
    )
  )
}
