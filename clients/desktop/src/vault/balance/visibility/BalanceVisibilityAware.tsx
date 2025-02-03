import styled from 'styled-components';

import { AsteriskIcon } from '../../../lib/ui/icons/AsteriskIcon';
import { ChildrenProp } from '../../../lib/ui/props';
import { range } from '@lib/utils/array/range';
import { useIsVaultBalanceVisible } from './useIsVaultBalanceVisible';

type BalanceSize = 'm' | 'l' | 'xxxl';

type BalanceVisibilityAwareProps = ChildrenProp & {
  size?: BalanceSize;
};

const hiddenContentLength: Record<BalanceSize, number> = {
  m: 4,
  l: 8,
  xxxl: 34,
};

const Icon = styled(AsteriskIcon)`
  &:not(:first-child) {
    margin-left: -0.32em;
  }
`;

export const BalanceVisibilityAware = ({
  children,
  size = 'm',
}: BalanceVisibilityAwareProps) => {
  const [isVisible] = useIsVaultBalanceVisible();

  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {range(hiddenContentLength[size]).map(key => (
        <Icon key={key} />
      ))}
    </>
  );
};
