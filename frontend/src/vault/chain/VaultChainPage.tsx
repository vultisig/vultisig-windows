import { IconButton } from '../../lib/ui/buttons/IconButton';
import { BoxIcon } from '../../lib/ui/icons/BoxIcon';
import { CopyIcon } from '../../lib/ui/icons/CopyIcon';
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon';
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { Text } from '../../lib/ui/text';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useCurrentVaultChainId } from './useCurrentVaultChainId';

export const VaultChainPage = () => {
  const chainId = useCurrentVaultChainId();

  return (
    <VStack fill>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton icon={<RefreshIcon />} />
          </PageHeaderIconButtons>
        }
        title={<PageHeaderTitle>{chainId}</PageHeaderTitle>}
      />
      <PageContent>
        <Panel withSections>
          <VStack fullWidth gap={8}>
            <HStack
              fullWidth
              alignItems="center"
              justifyContent="space-between"
            >
              <Text weight="600" color="contrast">
                {chainId}
              </Text>
              <HStack>
                <IconButton
                  kind="secondary"
                  title="Copy address"
                  icon={<CopyIcon />}
                />
                <IconButton
                  kind="secondary"
                  title="Address QR code"
                  icon={<QrCodeIcon />}
                />
                <IconButton
                  kind="secondary"
                  title="Block explorer"
                  icon={<BoxIcon />}
                />
              </HStack>
            </HStack>
          </VStack>
          <div>second sections</div>
        </Panel>
      </PageContent>
    </VStack>
  );
};
