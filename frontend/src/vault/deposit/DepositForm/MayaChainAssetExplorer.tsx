import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { MayaChainPool } from '../../../lib/types/deposit';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { DepositActionOption } from './DepositActionOption';

type MayaChainAssetExplorerProps = {
  options: MayaChainPool[];
  onClose: () => void;
  onOptionClick: (option: string) => void;
  activeOption?: string;
};

export const MayaChainAssetExplorer: FC<MayaChainAssetExplorerProps> = ({
  onClose,
  options,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      width={480}
      placement="top"
      title={t('choose_tokens')}
      onClose={onClose}
    >
      <VStack gap={20}>
        {options.map((option, index) => {
          const assetName = option.asset;

          return (
            <DepositActionOption
              key={index}
              value={t(assetName)}
              isActive={activeOption === assetName}
              onClick={() => {
                onOptionClick(assetName);
                onClose();
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
