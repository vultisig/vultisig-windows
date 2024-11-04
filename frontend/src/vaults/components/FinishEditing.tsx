import { useTranslation } from 'react-i18next';

import { Hoverable } from '../../lib/ui/base/Hoverable';
import { ClickableComponentProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';

export const FinishEditing: React.FC<ClickableComponentProps> = ({
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <Hoverable onClick={onClick}>
      <Text color="contrast" size={14} weight="600">
        {t('done')}
      </Text>
    </Hoverable>
  );
};
