import { describe, expect, it, vi } from 'vitest';

import { deepLinkBaseUrl } from '../../../../constants';
import { ReshareMessage } from '../../../../gen/vultisig/keygen/v1/reshare_message_pb';
import * as queryUtils from '../../../../lib/utils/query/addQueryParams';
import * as protobufUtils from '../../../../utils/protobuf/toCompressedString';
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
    const toCompressedStringSpy = vi
      .spyOn(protobufUtils, 'toCompressedString')
      .mockResolvedValue(mockCompressedString);

    const addQueryParamsSpy = vi
      .spyOn(queryUtils, 'addQueryParams')
      .mockReturnValue(
        'https://example.com?type=NewVault&tssType=Reshare&jsonData=mockCompressedString'
      );

    const result = await getJoinReshareUrl(mockInput);

    expect(toCompressedStringSpy).toHaveBeenCalled();
    const constructedMessage = toCompressedStringSpy.mock
      .calls[0][0] as ReshareMessage;
    expect(constructedMessage.sessionId).toBe(mockInput.sessionId);
    expect(constructedMessage.hexChainCode).toBe(mockInput.hexChainCode);
    expect(constructedMessage.serviceName).toBe(mockInput.serviceName);
    expect(constructedMessage.encryptionKeyHex).toBe(
      mockInput.hexEncryptionKey
    );
    expect(constructedMessage.useVultisigRelay).toBe(true);
    expect(constructedMessage.vaultName).toBe(mockInput.vaultName);
    expect(constructedMessage.publicKeyEcdsa).toBe(mockInput.publicKeyEcdsa);
    expect(constructedMessage.oldResharePrefix).toBe(
      mockInput.oldResharePrefix
    );
    expect(constructedMessage.oldParties).toEqual(mockInput.oldParties);

    expect(addQueryParamsSpy).toHaveBeenCalledWith(deepLinkBaseUrl, {
      type: 'NewVault',
      tssType: 'Reshare',
      jsonData: mockCompressedString,
    });

    expect(result).toBe(
      'https://example.com?type=NewVault&tssType=Reshare&jsonData=mockCompressedString'
    );

    toCompressedStringSpy.mockRestore();
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

    vi.spyOn(protobufUtils, 'toCompressedString').mockResolvedValue(
      mockCompressedString
    );

    vi.spyOn(queryUtils, 'addQueryParams').mockReturnValue(
      `https://example.com?type=NewVault&tssType=Reshare&jsonData=${mockCompressedString}`
    );

    const result = await getJoinReshareUrl(mockInput);

    expect(result).toContain(`jsonData=${mockCompressedString}`);

    vi.restoreAllMocks();
  });
});
