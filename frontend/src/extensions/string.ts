declare global {
  interface String {
    asUrl(): URL;
    stripHexPrefix(): string;
  }
}

String.prototype.asUrl = function (): URL {
  return new URL(this.toString());
};

String.prototype.stripHexPrefix = function (): string {
  return this.replace(/^0x/, '');
};

export {};
