type I18nGlossaryEntry = {
  term: string
  preserve: boolean
  note: string
  targetTerms?: string[]
}

// Native renderings chosen by the per-locale reviewer glossaries.
const vaultShareTargetTerms = [
  'Vault Share',
  'Vault Shares',
  'Tresoranteil',
  'Tresoranteile',
  'fragmento',
  'fragmentos',
  'Fragmento',
  'quota',
  'quote',
  'Quota',
  'udio',
  'udjela',
  'udjele',
  'Udio',
  'kluisdeel',
  'kluisdelen',
  'Kluisdeel',
  'parte do cofre',
  'parte do seu cofre',
  'partes do cofre',
  'Parte do cofre',
  'part de coffre',
  'Part de coffre',
  'parts de coffre',
  'Part du coffre',
  'part serveur',
  'Доля',
  'доли',
  'долю',
  'долей',
  '볼트 셰어',
  '保险库份额',
]

const poolTargetTerms = [
  'Pool',
  'pool',
  'poola',
  'poolu',
  'Пул',
  'пул',
  '풀',
  '池',
]

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
    targetTerms: vaultShareTargetTerms,
  },
  {
    term: 'Vault Shares',
    preserve: true,
    note: 'Core Vultisig recovery concept; keep exactly as written.',
    targetTerms: vaultShareTargetTerms,
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
    term: 'MayaChain',
    preserve: true,
    note: 'Chain name; keep exactly as written.',
  },
  {
    term: 'Kamino',
    preserve: true,
    note: 'Protocol name; keep exactly as written. Machine translation renders it as a common noun (zh: 神之野) or transliterates it (ru: Камино), neither of which names the protocol.',
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
    targetTerms: [
      'Bandwidth Points',
      'Bandwidth',
      'Bodovi propusnosti',
      'points de bande passante',
      '대역폭 포인트',
      '带宽',
    ],
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
    term: 'personal_sign',
    preserve: true,
    note: 'Signing method name the user types; keep exactly as written.',
  },
  {
    term: 'eth_signTypedData_v4',
    preserve: true,
    note: 'Signing method name the user types; keep exactly as written.',
  },
  {
    term: 'dApps',
    preserve: true,
    note: 'Web3 app term; keep capitalization exactly as written.',
    targetTerms: ['dApps', 'dApp', 'dAppovi'],
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
    targetTerms: [
      'Broadcasting',
      '브로드캐스팅',
      '브로드캐스트',
      'übertragen',
      'Transmitiendo',
      'Transmitindo',
      'Slanje',
      'Отправка',
      'verzenden',
      'Diffusion',
      '广播',
    ],
  },
  {
    term: 'Pool',
    preserve: true,
    note: 'DeFi pool term; avoid swimming-pool false friends.',
    targetTerms: poolTargetTerms,
  },
  {
    term: 'pool',
    preserve: true,
    note: 'DeFi pool term; avoid swimming-pool false friends.',
    targetTerms: poolTargetTerms,
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
