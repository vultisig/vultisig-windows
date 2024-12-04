import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { horizontalPadding } from '../../../../lib/ui/css/horizontalPadding';
import { takeWholeSpace } from '../../../../lib/ui/css/takeWholeSpace';
import { toSizeUnit } from '../../../../lib/ui/css/toSizeUnit';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { text } from '../../../../lib/ui/text';
import { formatAmount } from '../../../../lib/utils/formatAmount';
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery';
import { useToCoin } from '../../state/toCoin';
import { AmountContainer } from './AmountContainer';
import { AmountLabel } from './AmountLabel';
import { amountConfig } from './config';
import { SwapFiatAmount } from './SwapFiatAmount';

const Value = styled.div`
  ${takeWholeSpace};
  padding-top: ${toSizeUnit(amountConfig.inputPaddingTop)};
  ${horizontalPadding(amountConfig.horizontalPadding)}

  ${text({
    weight: 700,
    size: 20,
    family: 'mono',
    color: 'supporting',
    centerVertically: true,
  })}
`;

export const ToAmount = () => {
  const query = useSwapOutputAmountQuery();
  const [toCoin] = useToCoin();

  const { t } = useTranslation();

  return (
    <AmountContainer>
      <AmountLabel>{t('to')}</AmountLabel>
      <QueryDependant
        query={query}
        pending={() => null}
        error={() => null}
        success={value => (
          <SwapFiatAmount value={{ amount: value, ...toCoin }} />
        )}
      />
      <Value>
        <QueryDependant
          query={query}
          pending={() => (query.isLoading ? <Spinner /> : formatAmount(0))}
          error={() => formatAmount(0)}
          success={value => formatAmount(value)}
        />
      </Value>
    </AmountContainer>
  );
};
