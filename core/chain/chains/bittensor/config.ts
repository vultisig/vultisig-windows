export const bittensorConfig = {
  fee: BigInt(100000),
  existentialDeposit: BigInt(500),
  minTransferAmount: BigInt(500_000),
  // TODO: Move to env/secrets before production
  taostatsApiKey: 'tao-43f7c8f7-0a77-49aa-9f66-17fc112b3c10:3bc1d30d',
  taostatsApiUrl: 'https://api.taostats.io/api',
}
