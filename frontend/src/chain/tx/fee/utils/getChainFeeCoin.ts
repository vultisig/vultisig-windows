import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../../model/chain';
import { getNativeTokens } from '../../../../utils/getNativeTokens';

export const getChainFeeCoin = (chain: Chain) =>
  shouldBePresent(getNativeTokens().find(token => token.chain === chain));
