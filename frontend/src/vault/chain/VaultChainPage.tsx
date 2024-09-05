import { ChainEntityIcon } from '../../chain/ui/ChainEntityIcon';
import { fromChainAmount } from '../../chain/utils/fromChainAmount';
import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { hasMultipleCoinsSupport } from '../../chain/utils/hasMultipleCoinsSupport';
import { IconButton } from '../../lib/ui/buttons/IconButton';
import { BoxIcon } from '../../lib/ui/icons/BoxIcon';
import { CopyIcon } from '../../lib/ui/icons/CopyIcon';
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon';
import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { Panel } from '../../lib/ui/panel/Panel';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { getQueryDependantDefaultProps } from '../../lib/ui/query/utils/getQueryDependantDefaultProps';
import { Text } from '../../lib/ui/text';
import { sum } from '../../lib/utils/array/sum';
import { formatAmount } from '../../lib/utils/formatAmount';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useVaultAddressQuery } from '../queries/useVaultAddressQuery';
import { useVaultChainCoinsQuery } from '../queries/useVaultChainCoinsQuery';
import { ManageVaultChainCoinsPrompt } from './manage/coin/ManageVaultChainCoinsPrompt';
import { useCurrentVaultChainId } from './useCurrentVaultChainId';
import { VaultChainCoinItem } from './VaultChainCoinItem';

export const VaultChainPage = () => {
  const chainId = useCurrentVaultChainId();

  const vaultAddressQuery = useVaultAddressQuery(chainId);

  const vaultCoinsQuery = useVaultChainCoinsQuery(chainId);

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
      <PageContent gap={16}>
        <Panel withSections>
          <VStack fullWidth gap={8}>
            <HStack
              fullWidth
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack alignItems="center" gap={12}>
                <ChainEntityIcon
                  value={getChainEntityIconSrc(chainId)}
                  style={{ fontSize: 32 }}
                />
                <Text weight="700" color="contrast">
                  {chainId}
                </Text>
              </HStack>
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
            <QueryDependant
              query={vaultCoinsQuery}
              {...getQueryDependantDefaultProps('vault address')}
              success={coins => {
                const total = sum(
                  coins.map(
                    ({ amount, decimals, price = 0 }) =>
                      fromChainAmount(amount, decimals) * price
                  )
                );

                return (
                  <Text size={20} weight="700" color="contrast">
                    ${formatAmount(total)}
                  </Text>
                );
              }}
            />
            <QueryDependant
              query={vaultAddressQuery}
              {...getQueryDependantDefaultProps('vault address')}
              success={address => (
                <Text size={14} weight="500" color="primary">
                  {address}
                </Text>
              )}
            />
          </VStack>
          <QueryDependant
            query={vaultCoinsQuery}
            {...getQueryDependantDefaultProps('vault address')}
            success={coins => {
              return (
                <>
                  {coins.map(coin => (
                    <VaultChainCoinItem key={coin.id} value={coin} />
                  ))}
                </>
              );
            }}
          />
        </Panel>
        {hasMultipleCoinsSupport[chainId] && (
          <ManageVaultChainCoinsPrompt value={chainId} />
        )}
      </PageContent>
    </VStack>
  );
};
