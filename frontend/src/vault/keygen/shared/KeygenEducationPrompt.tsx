import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { InfoIcon } from '../../../lib/ui/icons/InfoIcon';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';

const resourceUrl =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault';

export const KeygenEducationPrompt = () => {
  return (
    <PageHeaderIconButton
      onClick={() => {
        BrowserOpenURL(resourceUrl);
      }}
      icon={<InfoIcon />}
    />
  );
};
