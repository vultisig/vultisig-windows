import { FC } from 'react';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';

type DepositVerifyProps = {
  onBack: () => void;
};

export const DepositVerify: FC<DepositVerifyProps> = ({ onBack }) => {
  return <UnstyledButton onClick={onBack}>DepositVerify</UnstyledButton>;
};
