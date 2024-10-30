import { useMutation } from '@tanstack/react-query';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { SaveFile } from '../../../wailsjs/go/main/App';
import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';
import { Button } from '../../lib/ui/buttons/Button';
import { Text } from '../../lib/ui/text';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { extractErrorMsg } from '../../lib/utils/error/extractErrorMsg';
import { ProductLogo } from '../../ui/logo/ProductLogo';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../ui/page/PageSlice';
import { PrintableQrCode } from '../../ui/qr/PrintableQrCode';
import { useVaultAddressQuery } from '../../vault/queries/useVaultAddressQuery';
import { useVaultChainsBalancesQuery } from '../../vault/queries/useVaultChainsBalancesQuery';
import { VULTISIG_WEBSITE_LINK } from '../vaultSettings/constants';
import {
  HiddenQRWrapper,
  ListItem,
  ListWrapper,
  LogoAndListWrapper,
  OneOffButton,
  SaveVaultQRWrapper,
  Wrapper,
} from './RegisterForAirdropPage.styles';

const RegisterForAirdropPage = () => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { data = [] } = useVaultChainsBalancesQuery();
  const {
    data: address,
    isFetching,
    error,
  } = useVaultAddressQuery(data[0].chainId);

  const { mutate: saveFile } = useMutation({
    mutationFn: async (node: HTMLDivElement) => {
      const dataUrl = await toPng(node);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      return SaveFile(`${address}.png`, base64Data);
    },
  });

  return (
    <PageSlice flexGrow>
      <PageHeader
        data-testid="EditVaultPage-PageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_register_for_airdrop_title')}
          </PageHeaderTitle>
        }
      />
      <PageContent>
        <Wrapper>
          <LogoAndListWrapper>
            <ProductLogo style={{ fontSize: 280 }} />
            <ListWrapper>
              <ListItem>
                1. {t('vault_register_for_airdrop_list_item_1')}
              </ListItem>
              <ListItem>
                2. {t('vault_register_for_airdrop_list_item_2_part_1')}{' '}
                <OneOffButton
                  onClick={() => BrowserOpenURL(VULTISIG_WEBSITE_LINK)}
                >
                  {t('vault_register_for_airdrop_list_item_2_part_2')}
                </OneOffButton>
              </ListItem>
              <ListItem>
                3. {t('vault_register_for_airdrop_list_item_3')}
              </ListItem>
              <ListItem>
                4. {t('vault_register_for_airdrop_list_item_4')}
              </ListItem>
            </ListWrapper>
          </LogoAndListWrapper>
          <SaveVaultQRWrapper>
            <Button
              disabled={isFetching || !address || Boolean(error)}
              isLoading={isFetching}
              onClick={() =>
                nodeRef.current && saveFile(shouldBePresent(nodeRef.current))
              }
              kind="primary"
            >
              {t('vault_register_for_airdrop_save_vault_QR_button')}
            </Button>
            {error && (
              <Text color="danger" size={12}>
                {extractErrorMsg(error)}
              </Text>
            )}
            <HiddenQRWrapper>
              <div ref={nodeRef}>
                <PrintableQrCode title={address} value={address || ''} />
              </div>
            </HiddenQRWrapper>
          </SaveVaultQRWrapper>
        </Wrapper>
      </PageContent>
    </PageSlice>
  );
};

export default RegisterForAirdropPage;
