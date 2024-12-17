import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { horizontalPadding } from '../../../../lib/ui/css/horizontalPadding';
import { takeWholeSpace } from '../../../../lib/ui/css/takeWholeSpace';
import {
  interactiveTextInput,
  textInputBorderRadius,
} from '../../../../lib/ui/css/textInput';
import { toSizeUnit } from '../../../../lib/ui/css/toSizeUnit';
import { InputDebounce } from '../../../../lib/ui/inputs/InputDebounce';
import { text } from '../../../../lib/ui/text';
import { useFromAmount } from '../../state/fromAmount';
import { useFromCoin } from '../../state/fromCoin';
import { AmountContainer } from './AmountContainer';
import { AmountLabel } from './AmountLabel';
import { amountConfig } from './config';
import { SwapFiatAmount } from './SwapFiatAmount';

const Input = styled.input`
  ${takeWholeSpace};
  padding-top: ${toSizeUnit(amountConfig.inputPaddingTop)};
  ${horizontalPadding(amountConfig.horizontalPadding)}

  ${text({
    weight: 700,
    size: 20,
    family: 'mono',
    color: 'contrast',
  })}

  &::placeholder {
    ${text({
      color: 'shy',
    })}
  }

  background: transparent;

  ${textInputBorderRadius};

  ${interactiveTextInput};
`;

export const ManageFromAmount = () => {
  const [value, setValue] = useFromAmount();

  const [fromCoin] = useFromCoin();

  const valueAsString = value?.toString() ?? '';
  const [inputValue, setInputValue] = useState<string>(valueAsString);

  const { t } = useTranslation();

  const handleInputValueChange = useCallback(
    (value: string) => {
      value = value.replace(/-/g, '');

      if (value === '') {
        setInputValue('');
        setValue?.(null);
        return;
      }

      const valueAsNumber = parseFloat(value);
      if (isNaN(valueAsNumber)) {
        return;
      }

      setInputValue(
        valueAsNumber.toString() !== value ? value : valueAsNumber.toString()
      );
      setValue?.(valueAsNumber);
    },
    [setValue]
  );

  return (
    <AmountContainer>
      <AmountLabel>{t('from')}</AmountLabel>
      {value !== null && (
        <SwapFiatAmount value={{ amount: value, ...fromCoin }} />
      )}
      <InputDebounce
        value={
          Number(valueAsString) === Number(inputValue)
            ? inputValue
            : valueAsString
        }
        onChange={handleInputValueChange}
        render={({ value, onChange }) => (
          <Input
            type="number"
            placeholder={t('enter_amount')}
            onWheel={event => event.currentTarget.blur()}
            value={value}
            onChange={({ currentTarget: { value } }) => onChange(value)}
          />
        )}
      />
    </AmountContainer>
  );
};
