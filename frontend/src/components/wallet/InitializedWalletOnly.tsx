import { useWalletCore } from '../../main';

export const InitializedWalletOnly: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const walletCore = useWalletCore();

  if (!walletCore) {
    return <div>Loading WalletCore...</div>;
  }

  return <>{children}</>;
};
