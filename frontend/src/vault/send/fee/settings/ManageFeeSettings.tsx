import { Opener } from '../../../../lib/ui/base/Opener';
import { SettingsIcon } from '../../../../lib/ui/icons/SettingsIcon';
import { Modal } from '../../../../lib/ui/modal';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';

export const ManageFeeSettings = () => {
  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <PageHeaderIconButton onClick={onOpen} icon={<SettingsIcon />} />
      )}
      renderContent={({ onClose }) => (
        <Modal onClose={onClose} title="Manage Fee Settings" />
      )}
    />
  );
};
