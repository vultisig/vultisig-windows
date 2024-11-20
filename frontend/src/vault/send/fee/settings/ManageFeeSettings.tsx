import { Opener } from '../../../../lib/ui/base/Opener';
import { SettingsIcon } from '../../../../lib/ui/icons/SettingsIcon';
import { EvmChain } from '../../../../model/chain';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { useCurrentSendCoin } from '../../state/sendCoin';
import { ManageFeeSettingsOverlay } from './ManageFeeSettingsOverlay';

export const ManageFeeSettings = () => {
  const [{ chainId }] = useCurrentSendCoin();

  if (!(chainId in EvmChain)) {
    return null;
  }

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <PageHeaderIconButton onClick={onOpen} icon={<SettingsIcon />} />
      )}
      renderContent={({ onClose }) => (
        <ManageFeeSettingsOverlay onClose={onClose} />
      )}
    />
  );
};
