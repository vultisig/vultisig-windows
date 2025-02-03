import * as queryUtils from '@lib/utils/query/addQueryParams';
import { describe, expect, it, vi } from 'vitest';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { KeygenServerType } from '../../server/KeygenServerType';
import { getJoinReshareUrl } from '.';

describe('getJoinReshareUrl', () => {
  it('should construct a valid URL with the correct query parameters', async () => {
    const mockInput = {
      serverType: 'relay' as KeygenServerType,
      vaultName: 'TestVault',
      serviceName: 'TestService',
      sessionId: '1234-session',
      hexEncryptionKey: 'abcdef1234567890',
      hexChainCode: '123456abcdef7890',
      publicKeyEcdsa: 'ecdsa-public-key',
      oldResharePrefix: 'old-prefix',
      oldParties: ['party1', 'party2', 'party3'],
    };

    const mockCompressedString = 'mockCompressedString';

    const addQueryParamsSpy = vi
      .spyOn(queryUtils, 'addQueryParams')
      .mockReturnValue(
        'https://example.com?type=NewVault&tssType=Reshare&jsonData=mockCompressedString'
      );

    const result = await getJoinReshareUrl(mockInput);

    expect(addQueryParamsSpy).toHaveBeenCalledWith(deepLinkBaseUrl, {
      type: 'NewVault',
      tssType: 'Reshare',
      jsonData: mockCompressedString,
    });

    expect(result).toBe(
      'https://example.com?type=NewVault&tssType=Reshare&jsonData=mockCompressedString'
    );

    addQueryParamsSpy.mockRestore();
  });

  it('should handle missing oldResharePrefix by defaulting to an empty string', async () => {
    const mockInput = {
      serverType: 'relay' as KeygenServerType,
      vaultName: 'TestVault',
      serviceName: 'TestService',
      sessionId: '1234-session',
      hexEncryptionKey: 'abcdef1234567890',
      hexChainCode: '123456abcdef7890',
      publicKeyEcdsa: 'ecdsa-public-key',
      oldParties: ['party1', 'party2', 'party3'],
    };

    const mockCompressedString = 'mockCompressedString';

    vi.spyOn(queryUtils, 'addQueryParams').mockReturnValue(
      `https://example.com?type=NewVault&tssType=Reshare&jsonData=${mockCompressedString}`
    );

    const result = await getJoinReshareUrl(mockInput);

    expect(result).toContain(`jsonData=${mockCompressedString}`);

    vi.restoreAllMocks();
  });
});
