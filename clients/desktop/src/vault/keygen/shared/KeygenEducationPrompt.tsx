import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { QuestionMarkIcon } from '../../../lib/ui/icons/QuestionMarkIcon';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';

const resourceUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault';

export const KeygenEducationPrompt = () => {
  return (
    <PageHeaderIconButton
      onClick={() => {
        BrowserOpenURL(resourceUrl);
      }}
      icon={<QuestionMarkIcon />}
    />
  );
};
