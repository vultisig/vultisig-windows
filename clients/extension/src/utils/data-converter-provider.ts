import { Buffer } from "buffer";
import SevenZip, { SevenZipModule } from "7z-wasm";

import { errorKey } from "./constants";

export default class DataConverterProvider {
  private sevenZip?: SevenZipModule;

  private getCompressor = (): Promise<SevenZipModule> => {
    return new Promise((resolve, reject) => {
      if (this.sevenZip) {
        resolve(this.sevenZip);
      } else {
        SevenZip()
          .then((compressor) => {
            this.sevenZip = compressor;

            resolve(this.sevenZip);
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };

  public compressor = (data: Uint8Array): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      this.getCompressor()
        .then((compressor) => {
          const archiveName = "compressed.xz";

          compressor.FS.writeFile("data.bin", Buffer.from(data));
          compressor.callMain(["a", archiveName, "data.bin"]);

          const compressedData = compressor.FS.readFile(archiveName);

          resolve(compressedData);
        })
        .catch(reject);
    });
  };

  public encoder = (data: Uint8Array): string => {
    return Buffer.from(data).toString("base64");
  };

  public compactEncoder = (data: Uint8Array): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.compressor(data)
        .then((compressedData) => {
          resolve(this.encoder(compressedData));
        })
        .catch(reject);
    });
  };
}
