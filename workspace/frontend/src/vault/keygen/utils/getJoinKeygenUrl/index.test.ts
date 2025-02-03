import * as queryUtils from '@lib/utils/query/addQueryParams';
import { describe, expect, it, vi } from 'vitest';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { KeygenServerType } from '../../server/KeygenServerType';
import { getJoinKeygenUrl } from '.';

describe('getJoinKeygenUrl', () => {
  it('should construct a valid URL with the correct query parameters', async () => {
    const mockInput = {
      serverType: 'relay' as KeygenServerType,
      vaultName: 'TestVault',
      serviceName: 'TestService',
      sessionId: '1234-session',
      hexEncryptionKey: 'abcdef1234567890',
      hexChainCode: '123456abcdef7890',
    };

    const mockCompressedString = 'mockCompressedString';

    const addQueryParamsSpy = vi
      .spyOn(queryUtils, 'addQueryParams')
      .mockReturnValue(
        'https://example.com?type=NewVault&tssType=Keygen&jsonData=mockCompressedString'
      );

    const result = await getJoinKeygenUrl(mockInput);

    expect(addQueryParamsSpy).toHaveBeenCalledWith(deepLinkBaseUrl, {
      type: 'NewVault',
      tssType: 'Keygen',
      jsonData: mockCompressedString,
    });

    expect(result).toBe(
      'https://example.com?type=NewVault&tssType=Keygen&jsonData=mockCompressedString'
    );

    addQueryParamsSpy.mockRestore();
  });
});
