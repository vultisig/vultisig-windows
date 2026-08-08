type I18nGlossaryEntry = {
  term: string
  preserve: boolean
  note: string
  targetTerms?: string[]
}

export const i18nGlossary = [
  {
    term: '$VULT',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'Vulti Agent',
    preserve: true,
    note: 'Product name; keep exactly as written.',
  },
  {
    term: 'Vultisig Extension',
    preserve: true,
    note: 'Product name; keep exactly as written.',
  },
  {
    term: 'Vultisig',
    preserve: true,
    note: 'Brand name; keep exactly as written.',
  },
  {
    term: 'Station',
    preserve: true,
    note: 'Brand name; keep exactly as written.',
  },
  {
    term: 'Vultiserver',
    preserve: true,
    note: 'Service name; keep exactly as written.',
  },
  {
    term: 'Fast Vault',
    preserve: true,
    note: 'Vault product type; keep exactly as written.',
  },
  {
    term: 'Secure Vault',
    preserve: true,
    note: 'Vault product type; keep exactly as written.',
  },
  {
    term: 'Vault Share',
    preserve: true,
    note: 'Core Vultisig recovery concept; keep exactly as written.',
  },
  {
    term: 'Vault Shares',
    preserve: true,
    note: 'Core Vultisig recovery concept; keep exactly as written.',
  },
  {
    term: 'QBTC',
    preserve: true,
    note: 'Asset and chain name; keep exactly as written.',
  },
  {
    term: 'THORChain',
    preserve: true,
    note: 'Chain name; keep exactly as written.',
  },
  {
    term: 'THORName',
    preserve: true,
    note: 'Protocol name; keep exactly as written.',
  },
  {
    term: 'Ethereum',
    preserve: true,
    note: 'Chain name; keep exactly as written.',
  },
  {
    term: 'BTC',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'CACAO',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'RUNE',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'TRON',
    preserve: true,
    note: 'Chain name; keep exactly as written.',
  },
  {
    term: 'TRX',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'USDC',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'USDT',
    preserve: true,
    note: 'Token ticker; keep exactly as written.',
  },
  {
    term: 'TON',
    preserve: true,
    note: 'Network name (The Open Network); never translate as a unit of weight. The native token rebranded TON -> GRAM (2026-06-15).',
  },
  {
    term: 'GRAM',
    preserve: true,
    note: 'Native token ticker of The Open Network (formerly TON); keep exactly as written.',
  },
  {
    term: 'Jetton',
    preserve: true,
    note: 'TON token standard; keep exactly as written.',
  },
  {
    term: 'Bandwidth Points',
    preserve: true,
    note: 'TRON resource name; keep exactly as written.',
  },
  {
    term: 'UTXOs',
    preserve: true,
    note: 'Blockchain accounting term; keep exactly as written.',
    targetTerms: ['UTXOs', 'UTXO', 'UTXO&#39;s', 'UTXO-ovi', 'UTXO-i'],
  },
  {
    term: 'UTXO',
    preserve: true,
    note: 'Blockchain accounting term; keep exactly as written.',
  },
  {
    term: 'TXID',
    preserve: true,
    note: 'Transaction identifier acronym; keep exactly as written.',
  },
  {
    term: 'REST',
    preserve: true,
    note: 'API acronym; keep exactly as written.',
  },
  {
    term: 'RPC',
    preserve: true,
    note: 'API acronym; keep exactly as written.',
  },
  {
    term: 'NFT',
    preserve: true,
    note: 'Token standard acronym; keep exactly as written.',
  },
  {
    term: 'dApps',
    preserve: true,
    note: 'Web3 app term; keep capitalization exactly as written.',
  },
  {
    term: 'dApp',
    preserve: true,
    note: 'Web3 app term; keep capitalization exactly as written.',
  },
  {
    term: 'DeFi',
    preserve: true,
    note: 'Web3 finance term; keep capitalization exactly as written.',
  },
  {
    term: 'Broadcasting',
    preserve: true,
    note: 'Transaction status term; avoid TV/radio false friends.',
    targetTerms: ['Broadcasting', '브로드캐스팅'],
  },
  {
    term: 'Pool',
    preserve: true,
    note: 'DeFi pool term; avoid swimming-pool false friends.',
  },
  {
    term: 'pool',
    preserve: true,
    note: 'DeFi pool term; avoid swimming-pool false friends.',
    targetTerms: ['Pool', 'pool'],
  },
  {
    term: 'contract',
    preserve: false,
    note: 'Translate as the smart-contract noun, not a verb.',
  },
  {
    term: 'backup',
    preserve: false,
    note: 'Safety-critical recovery copy; preserve the exact meaning.',
  },
  {
    term: 'recovery',
    preserve: false,
    note: 'Safety-critical recovery copy; preserve the exact meaning.',
  },
  {
    term: 'recover',
    preserve: false,
    note: 'Safety-critical recovery copy; preserve polarity and capability.',
  },
  {
    term: 'password',
    preserve: false,
    note: 'Safety-critical copy; preserve cannot/reset/recover polarity.',
  },
  {
    term: 'claim',
    preserve: false,
    note: 'Blockchain action; avoid legal/assertion false friends.',
  },
] satisfies I18nGlossaryEntry[]

export const preservedI18nGlossaryTerms = i18nGlossary
  .filter(({ preserve }) => preserve)
  .map(({ term }) => term)
