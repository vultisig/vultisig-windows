import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { KeygenMessage } from "../gen/vultisig/keygen/v1/keygen_message_pb";
import LZMA from "lzma-web";

function getHexEncodedRandomBytes(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes.toString("hex");
}
function generateRandomNumber(): number {
  return Math.floor(Math.random() * 900) + 100;
}
export async function createKeygenMsg(vaultName: string) {
  const lz = new LZMA();
  const sessionID = uuidv4();
  const encryptionKey = getHexEncodedRandomBytes(32);
  const hexChainCode = getHexEncodedRandomBytes(32);

  const keygenMessage = new KeygenMessage({
    sessionId: sessionID,
    hexChainCode: hexChainCode,
    serviceName: `VultisigWindows-${generateRandomNumber()}`,
    encryptionKeyHex: encryptionKey,
    useVultisigRelay: true,
    vaultName: vaultName,
  });

  const serializedData = keygenMessage.toBinary();
  const bufferData = Buffer.from(serializedData);
  const compressed = await lz.compress(bufferData);
  const base64EncodedData = Buffer.from(compressed).toString("base64");
  return base64EncodedData;
}
