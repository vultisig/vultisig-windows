import { useMutation } from '@tanstack/react-query';
import jsQR from 'jsqr';
import { getRawQueryParams } from '../../../lib/utils/query/getRawQueryParams';
import { decompressQrPayload } from './utils/decompressQrPayload';
import { match } from '../../../lib/utils/match';
import { Vault } from '../../../gen/vultisig/vault/v1/vault_pb';
import { SaveVault } from '../../../../wailsjs/go/storage/Store';
import { useNavigate } from 'react-router-dom';

type QrTtsType = 'Keygen' | 'Reshare';

type QrType = 'NewVault' | 'Keysign';

type QrSharedData = {
  jsonData: string;
  vault: string;
};

type QrQueryParams =
  | (QrSharedData & {
      type: QrType;
    })
  | (QrSharedData & {
      ttsType: QrTtsType;
    });

function stringToUint8Array(input: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(input);
}

export const useProcessQrMutation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (file: File) => {
      const imageBitmap = await createImageBitmap(file);

      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      context.drawImage(imageBitmap, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        throw new Error('Failed to read QR code');
      }

      const url = code.data;

      const queryParams = getRawQueryParams<QrQueryParams>(url);
      const { jsonData } = queryParams;

      const payload = await decompressQrPayload(jsonData);
      console.log(payload);

      if ('type' in queryParams) {
        return match(queryParams.type, {
          NewVault: async () => {
            console.log('todo: handle new vault');
            const vault = Vault.fromBinary(stringToUint8Array(payload));
            await SaveVault({
              name: vault.name,
              public_key_ecdsa: vault.publicKeyEcdsa,
              public_key_eddsa: vault.publicKeyEddsa,
              signers: vault.signers,
              created_at: vault.createdAt,
              hex_chain_code: vault.hexChainCode,
              keyshares: vault.keyShares.map(share => ({
                public_key: share.publicKey,
                keyshare: share.keyshare,
              })),
              local_party_id: vault.localPartyId,
              reshare_prefix: vault.resharePrefix,
              // todo: handle order
              order: 0,
              is_backed_up: true,
              coins: [],
              convertValues: () => {},
            });
            navigate('/vault/list');
          },
          Keysign: async () => {
            console.log('todo: handle key sign');
          },
        });
      } else {
        return match(queryParams.ttsType, {
          Keygen: () => {
            console.log('todo: handle keygen');
          },
          Reshare: () => {
            console.log('todo: handle reshare');
            const vault = Vault.fromBinary(stringToUint8Array(payload));
            console.log(vault);
          },
        });
      }
    },
  });
};
