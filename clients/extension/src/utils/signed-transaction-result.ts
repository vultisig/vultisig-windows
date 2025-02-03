export class SignedTransactionResult {
  rawTransaction: string;
  transactionHash: string;
  signature?: string;

  constructor(
    rawTransaction: string,
    transactionHash: string,
    signature?: string
  ) {
    this.rawTransaction = rawTransaction;
    this.transactionHash = transactionHash;
    this.signature = signature;
  }
}

export class SignedTransactionType {
  private constructor(
    public type: "regular" | "regularWithApprove",
    public approve?: SignedTransactionResult,
    public transaction?: SignedTransactionResult
  ) {}

  static create(
    transactions: SignedTransactionResult[]
  ): SignedTransactionType | null {
    if (transactions.length === 2) {
      return new SignedTransactionType(
        "regularWithApprove",
        transactions[0],
        transactions[1]
      );
    }

    if (transactions.length === 1) {
      return new SignedTransactionType("regular", undefined, transactions[0]);
    }

    return null;
  }

  get transactionHash(): string {
    switch (this.type) {
      case "regular":
        return this.transaction!.transactionHash;
      case "regularWithApprove":
        return this.transaction!.transactionHash;
      default:
        throw new Error("Invalid transaction type");
    }
  }
}
