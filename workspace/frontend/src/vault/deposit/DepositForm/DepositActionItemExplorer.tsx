import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Modal } from '../../../lib/ui/modal';
import { DepositActionOption } from './DepositActionOption';

type DepositActionItemExplorerProps = {
  options: string[];
  onClose: () => void;
  onOptionClick: (option: string) => void;
  activeOption?: string;
};

export const DepositActionItemExplorer: FC<DepositActionItemExplorerProps> = ({
  onClose,
  options,
  onOptionClick,
  activeOption,
}) => {
  const { t } = useTranslation();

  return (
    <Modal width={480} placement="top" title="" onClose={onClose}>
      <VStack gap={20}>
        {options.map((option, index) => {
          return (
            <DepositActionOption
              key={index}
              value={t(option)}
              isActive={activeOption === option}
              onClick={() => {
                onOptionClick(option);
                onClose();
              }}
            />
          );
        })}
      </VStack>
    </Modal>
  );
};
