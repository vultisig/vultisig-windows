import { useWalletCore } from '../../providers/WalletCoreProvider';
import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock';

export const InitializedWalletOnly: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const walletCore = useWalletCore();

  if (!walletCore) {
    return <ProductLogoBlock />;
  }

  return <>{children}</>;
};
