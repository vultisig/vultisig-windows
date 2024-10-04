import { TokenSelectionAssets } from '../../../../token-store';

export const getCoinOptions = () => {
  const nativeTokens = TokenSelectionAssets.filter(
    ({ isNativeToken }) => isNativeToken
  );
  return nativeTokens.map((item, index) => ({
    ...item,
    isLastOption: index === nativeTokens.length - 1,
  }));
};
