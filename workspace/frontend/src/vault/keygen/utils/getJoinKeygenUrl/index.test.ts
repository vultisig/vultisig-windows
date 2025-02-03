import { describe, expect, it, vi } from 'vitest';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { KeygenMessage } from '../../../../gen/vultisig/keygen/v1/keygen_message_pb';
import * as queryUtils from '../@lib/utils/query/addQueryParams';
import * as protobufUtils from '../../../../utils/protobuf/toCompressedString';
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
    const toCompressedStringSpy = vi
      .spyOn(protobufUtils, 'toCompressedString')
      .mockResolvedValue(mockCompressedString);

    const addQueryParamsSpy = vi
      .spyOn(queryUtils, 'addQueryParams')
      .mockReturnValue(
        'https://example.com?type=NewVault&tssType=Keygen&jsonData=mockCompressedString'
      );

    const result = await getJoinKeygenUrl(mockInput);

    expect(toCompressedStringSpy).toHaveBeenCalled();
    const constructedMessage = toCompressedStringSpy.mock
      .calls[0][0] as KeygenMessage;
    expect(constructedMessage.sessionId).toBe(mockInput.sessionId);
    expect(constructedMessage.hexChainCode).toBe(mockInput.hexChainCode);
    expect(constructedMessage.serviceName).toBe(mockInput.serviceName);
    expect(constructedMessage.encryptionKeyHex).toBe(
      mockInput.hexEncryptionKey
    );
    expect(constructedMessage.useVultisigRelay).toBe(true);
    expect(constructedMessage.vaultName).toBe(mockInput.vaultName);

    expect(addQueryParamsSpy).toHaveBeenCalledWith(deepLinkBaseUrl, {
      type: 'NewVault',
      tssType: 'Keygen',
      jsonData: mockCompressedString,
    });

    expect(result).toBe(
      'https://example.com?type=NewVault&tssType=Keygen&jsonData=mockCompressedString'
    );

    toCompressedStringSpy.mockRestore();
    addQueryParamsSpy.mockRestore();
  });
});
