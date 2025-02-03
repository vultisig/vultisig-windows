import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { ActionInsideInteractiveElement } from '../../../lib/ui/base/ActionInsideInteractiveElement';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { centerContent } from '../../../lib/ui/css/centerContent';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import { textInputHeight } from '../../../lib/ui/css/textInput';
import { toSizeUnit } from '../../../lib/ui/css/toSizeUnit';
import { AmountTextInput } from '../../../lib/ui/inputs/AmountTextInput';
import { HStack } from '../../../lib/ui/layout/Stack';
import { text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { SendCoinBalanceDependant } from '../coin/balance/SendCoinBalanceDependant';
import { useSendAmount } from '../state/amount';
import { AmountSuggestion } from './AmountSuggestion';

const suggestions = [0.25, 0.5];

const maxButtonOffset = 8;
const maxButtonHeight = textInputHeight - maxButtonOffset * 2;

const MaxButton = styled(UnstyledButton)`
  ${horizontalPadding(8)};
  ${borderRadius.s};
  ${centerContent};
  height: ${toSizeUnit(maxButtonHeight)};

  ${text({
    weight: 600,
    size: 16,
    color: 'contrast',
  })}

  &:hover {
    background: ${getColor('mist')};
  }

  text-transform: uppercase;
`;

export const ManageAmount = () => {
  const [value, setValue] = useSendAmount();
  const { t } = useTranslation();

  return (
    <ActionInsideInteractiveElement
      render={() => (
        <AmountTextInput
          label={t('amount')}
          suggestion={
            <SendCoinBalanceDependant
              pending={() => null}
              error={() => null}
              success={({ amount, decimals }) => (
                <HStack alignItems="center" gap={4}>
                  {suggestions.map(suggestion => (
                    <AmountSuggestion
                      onClick={() => {
                        setValue(
                          fromChainAmount(amount, decimals) * suggestion
                        );
                      }}
                      key={suggestion}
                      value={suggestion}
                    />
                  ))}
                </HStack>
              )}
            />
          }
          placeholder={t('enter_amount')}
          value={value}
          onValueChange={setValue}
        />
      )}
      action={
        <SendCoinBalanceDependant
          pending={() => null}
          error={() => null}
          success={({ amount, decimals }) => (
            <MaxButton
              onClick={() => {
                setValue(fromChainAmount(amount, decimals));
              }}
            >
              {t('max')}
            </MaxButton>
          )}
        />
      }
      actionPlacerStyles={{
        right: maxButtonOffset,
        bottom: maxButtonOffset,
      }}
    />
  );
};
