import { LibType } from "@core/communication/vultisig/keygen/v1/lib_type_message_pb";

export const mpcLibName: Record<LibType, string> = {
  [LibType.GG20]: "GG20",
  [LibType.DKLS]: "DKLS",
};
