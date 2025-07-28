import { DepositActionOption } from '@core/ui/vault/deposit/DepositForm/DepositActionOption'
import { MayaChainPool } from '@core/ui/vault/deposit/types/mayaChain'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type MayaChainAssetExplorerProps = {
  options: MayaChainPool[]
  onClose: () => void
  onOptionClick: (option: string) => void
  activeOption?: string
}

export const MayaChainAssetExplorer: FC<MayaChainAssetExplorerProps> = ({
  onClose,
  options,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('choose_tokens')}>
      <VStack gap={20}>
        {options.map((option, index) => {
          const assetName = option.asset

          return (
            <DepositActionOption
              key={index}
              value={assetName}
              isActive={activeOption === assetName}
              onClick={() => {
                onOptionClick(assetName)
                onClose()
              }}
            />
          )
        })}
      </VStack>
    </Modal>
  )
}
