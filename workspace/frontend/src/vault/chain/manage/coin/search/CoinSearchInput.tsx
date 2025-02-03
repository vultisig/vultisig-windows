import { useTranslation } from 'react-i18next';
import styled, { CSSProperties } from 'styled-components';

import { ActionsInsideInteractiveElement } from '../../../../../lib/ui/base/ActionsInsideInteractiveElement';
import { IconButton } from '../../../../../lib/ui/buttons/IconButton';
import { borderRadius } from '../../../../../lib/ui/css/borderRadius';
import { takeWholeSpace } from '../../../../../lib/ui/css/takeWholeSpace';
import { CloseIcon } from '../../../../../lib/ui/icons/CloseIcon';
import { IconWrapper } from '../../../../../lib/ui/icons/IconWrapper';
import { SearchIcon } from '../../../../../lib/ui/icons/SearchIcon';
import { hStack } from '../../../../../lib/ui/layout/Stack';
import { useCurrentSearch } from '../../../../../lib/ui/search/CurrentSearchProvider';
import { getColor } from '../../../../../lib/ui/theme/getters';
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields';
import { coinSearchConfig } from './config';

const IconContainer = styled(IconWrapper)`
  color: ${getColor('textSupporting')};
`;

const Wrapper = styled(ActionsInsideInteractiveElement)`
  height: 100%;
  flex: 1;
  ${hStack({
    alignItems: 'center',
  })}

  &:focus-within
  ${IconContainer} {
    color: ${getColor('contrast')};
  }
`;

const Input = styled.input`
  ${borderRadius.m};
  background: ${getColor('foreground')};
  ${takeWholeSpace};
`;

export const CoinSearchInput = () => {
  const [value, setValue] = useCurrentSearch();
  const { t } = useTranslation();

  return (
    <Wrapper
      actions={withoutUndefinedFields({
        search: {
          node: (
            <IconContainer>
              <SearchIcon />
            </IconContainer>
          ),
          placerStyles: {
            pointerEvents: 'none',
            left: coinSearchConfig.input.horizontalPadding,
            display: 'flex',
          } as CSSProperties,
        },
        clear: value
          ? {
              node: (
                <IconButton
                  onClick={() => setValue('')}
                  title={t('clear')}
                  icon={<CloseIcon />}
                />
              ),
              placerStyles: {
                right: coinSearchConfig.input.horizontalPadding,
              },
            }
          : undefined,
      })}
      render={({ actions }) => (
        <Input
          value={value}
          style={{
            paddingLeft:
              coinSearchConfig.input.horizontalPadding * 2 +
              actions.search.size.width,
            paddingRight:
              coinSearchConfig.input.horizontalPadding +
              (actions.clear?.size.width || 0),
          }}
          onChange={({ currentTarget }) => setValue(currentTarget.value)}
        />
      )}
    />
  );
};
