import { DB } from 'react-native-sqlite-manager'
import { v4 as uuidv4 } from 'uuid' // For generating UUID if needed

import type {
  AddressBookItem,
  Coin,
  KeyShare,
  Vault,
  VaultFolder,
} from './types'

const db = DB.get('vultisig.db')

// ------------------------------------
//  Vault CRUD
// ------------------------------------
export async function SaveVault(vault: Vault): Promise<void> {
  if (!vault.PublicKeyECDSA) {
    throw new Error('Invalid vault, public key ECDSA is required')
  }

  const signersJSON = JSON.stringify(vault.Signers || [])
  const isBackedUpVal = vault.IsBackedUp ? 1 : 0

  await db.executeTransaction(
    {
      sql: `
        INSERT OR REPLACE INTO vaults (
          name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
          local_party_id, signers, reshare_prefix, "order", is_backedup, folder_id, lib_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        vault.Name,
        vault.PublicKeyECDSA,
        vault.PublicKeyEdDSA,
        vault.CreatedAt,
        vault.HexChainCode,
        vault.LocalPartyID,
        signersJSON,
        vault.ResharePrefix,
        vault.Order,
        isBackedUpVal,
        vault.FolderID ?? null,
        vault.LibType,
      ],
    },

    ...vault.KeyShares.map(ks => ({
      sql: `
        INSERT OR REPLACE INTO keyshares (public_key_ecdsa, public_key, keyshare)
        VALUES (?, ?, ?)`,
      args: [vault.PublicKeyECDSA, ks.publicKey, ks.keyShare],
    })),

    ...vault.Coins.map(coin => ({
      sql: `
        INSERT OR REPLACE INTO coins (
          id, chain, address, hex_public_key, ticker, contract_address,
          is_native_token, logo, price_provider_id, decimals, public_key_ecdsa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        coin.ID || uuidv4(),
        coin.Chain,
        coin.Address,
        coin.HexPublicKey,
        coin.Ticker,
        coin.ContractAddress,
        coin.IsNativeToken ? 1 : 0,
        coin.Logo,
        coin.PriceProviderID,
        coin.Decimals,
        vault.PublicKeyECDSA,
      ],
    }))
  )
}

export async function UpdateVaultName(publicKeyECDSA: string, name: string) {
  const query = `UPDATE vaults SET name = ? WHERE public_key_ecdsa = ?`
  await db.executeSql(query, [name, publicKeyECDSA])
}

export async function UpdateVaultOrder(publicKeyECDSA: string, order: number) {
  const query = `UPDATE vaults SET "order" = ? WHERE public_key_ecdsa = ?`
  await db.executeSql(query, [order, publicKeyECDSA])
}

export async function UpdateVaultFolderID(
  publicKeyECDSA: string,
  folderID?: string
) {
  const query = `UPDATE vaults SET folder_id = ? WHERE public_key_ecdsa = ?`
  await db.executeSql(query, [folderID ?? null, publicKeyECDSA])
}

export async function UpdateVaultIsBackedUp(
  publicKeyECDSA: string,
  isBackedUp: boolean
) {
  const query = `UPDATE vaults SET is_backedup = ? WHERE public_key_ecdsa = ?`
  await db.executeSql(query, [isBackedUp ? 1 : 0, publicKeyECDSA])
}

export async function GetVault(publicKeyECDSA: string): Promise<Vault | null> {
  const query = `
    SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
    local_party_id, signers, reshare_prefix, "order", is_backedup, folder_id, lib_type
    FROM vaults
    WHERE public_key_ecdsa = ?
  `
  const { rows } = await db.executeSql(query, [publicKeyECDSA])
  if (!rows || rows.length === 0) {
    return null
  }

  const row = rows[0]
  const vault: Vault = {
    Name: row.name,
    PublicKeyECDSA: row.public_key_ecdsa,
    PublicKeyEdDSA: row.public_key_eddsa,
    CreatedAt: row.created_at,
    HexChainCode: row.hex_chain_code,
    LocalPartyID: row.local_party_id,
    Signers: [],
    ResharePrefix: row.reshare_prefix,
    Order: Number(row.order),
    IsBackedUp: row.is_backedup === 1,
    FolderID: row.folder_id || undefined,
    LibType: row.lib_type,
    KeyShares: [],
    Coins: [],
  }

  try {
    vault.Signers = JSON.parse(row.signers)
  } catch {
    console.error('Error parsing signers')
  }

  vault.KeyShares = await getKeyShares(publicKeyECDSA)
  vault.Coins = await GetCoins(publicKeyECDSA)

  return vault
}

export async function GetVaults(): Promise<Vault[]> {
  const query = `
    SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
    local_party_id, signers, reshare_prefix, "order", is_backedup, folder_id, lib_type
    FROM vaults
  `
  const { rows } = await db.executeSql(query, [])
  if (!rows || rows.length === 0) {
    return []
  }

  const vaults: Vault[] = rows.map((r: any) => {
    const v: Vault = {
      Name: r.name,
      PublicKeyECDSA: r.public_key_ecdsa,
      PublicKeyEdDSA: r.public_key_eddsa,
      CreatedAt: r.created_at,
      HexChainCode: r.hex_chain_code,
      LocalPartyID: r.local_party_id,
      Signers: [],
      ResharePrefix: r.reshare_prefix,
      Order: Number(r.order),
      IsBackedUp: r.is_backedup === 1,
      FolderID: r.folder_id || undefined,
      LibType: r.lib_type,
      KeyShares: [],
      Coins: [],
    }

    try {
      v.Signers = JSON.parse(r.signers)
    } catch {
      console.error('Error parsing signers')
    }
    return v
  })

  for (const v of vaults) {
    v.KeyShares = await getKeyShares(v.PublicKeyECDSA)
    v.Coins = await GetCoins(v.PublicKeyECDSA)
  }
  return vaults
}

export async function DeleteVault(publicKeyECDSA: string): Promise<void> {
  await db.executeSql(`DELETE FROM vaults WHERE public_key_ecdsa = ?`, [
    publicKeyECDSA,
  ])
}

// ------------------------------------
//  KeyShares (internal helper)
// ------------------------------------

async function getKeyShares(vaultPublicKeyECDSA: string): Promise<KeyShare[]> {
  const query = `
    SELECT public_key, keyshare
    FROM keyshares
    WHERE public_key_ecdsa = ?
  `
  const { rows } = await db.executeSql(query, [vaultPublicKeyECDSA])
  if (!rows) return []
  return rows.map((r: any) => ({
    publicKey: r.public_key,
    keyShare: r.keyshare,
  }))
}

// ------------------------------------
//  Coins
// ------------------------------------
export async function GetCoins(vaultPublicKeyECDSA: string): Promise<Coin[]> {
  const query = `
    SELECT id, chain, address, hex_public_key, ticker, contract_address,
           is_native_token, logo, price_provider_id, decimals
    FROM coins
    WHERE public_key_ecdsa = ?
  `
  const { rows } = await db.executeSql(query, [vaultPublicKeyECDSA])
  if (!rows) return []
  return rows.map((r: any) => ({
    ID: r.id,
    Chain: r.chain,
    Address: r.address,
    HexPublicKey: r.hex_public_key,
    Ticker: r.ticker,
    ContractAddress: r.contract_address,
    IsNativeToken: r.is_native_token === 1,
    Logo: r.logo,
    PriceProviderID: r.price_provider_id,
    Decimals: r.decimals,
  }))
}

export async function SaveCoin(
  vaultPublicKeyECDSA: string,
  coin: Coin
): Promise<string> {
  const query = `
    INSERT OR REPLACE INTO coins (
      id,
      chain,
      address,
      hex_public_key,
      ticker,
      contract_address,
      is_native_token,
      logo,
      price_provider_id,
      decimals,
      public_key_ecdsa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  let coinID = coin.ID
  if (!coinID) {
    coinID = uuidv4()
  }
  const isNativeTokenVal = coin.IsNativeToken ? 1 : 0
  await db.executeSql(query, [
    coinID,
    coin.Chain,
    coin.Address,
    coin.HexPublicKey,
    coin.Ticker,
    coin.ContractAddress,
    isNativeTokenVal,
    coin.Logo,
    coin.PriceProviderID,
    coin.Decimals,
    vaultPublicKeyECDSA,
  ])
  return coinID
}

/**
 * Save multiple coins in a single transaction
 */
export async function SaveCoins(
  vaultPublicKeyECDSA: string,
  coins: Coin[]
): Promise<string[]> {
  const coinIDs: string[] = []

  const requests = coins.map(coin => {
    const query = `
      INSERT OR REPLACE INTO coins (
        id,
        chain,
        address,
        hex_public_key,
        ticker,
        contract_address,
        is_native_token,
        logo,
        price_provider_id,
        decimals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const args = [
      coin.ID,
      coin.Chain,
      coin.Address,
      vaultPublicKeyECDSA,
      coin.Ticker,
      coin.ContractAddress,
      coin.IsNativeToken ? 1 : 0,
      coin.Logo,
      coin.PriceProviderID,
      coin.Decimals,
    ]

    coinIDs.push(coin.ID)

    return { sql: query, args }
  })

  await db.executeTransaction(...requests)

  return coinIDs
}

export async function DeleteCoin(
  vaultPublicKeyECDSA: string,
  coinID: string
): Promise<void> {
  await db.executeSql(
    `DELETE FROM coins WHERE id = ? AND public_key_ecdsa = ?`,
    [coinID, vaultPublicKeyECDSA]
  )
}

// ------------------------------------
//  Vault Folders
// ------------------------------------
export async function SaveVaultFolder(folder: VaultFolder): Promise<string> {
  if (!folder.ID) {
    folder.ID = uuidv4()
  }
  const query = `
    INSERT OR REPLACE INTO vault_folders (id, name, "order")
    VALUES (?, ?, ?)
  `
  await db.executeSql(query, [folder.ID, folder.Name, folder.Order])
  return folder.ID
}

export async function UpdateVaultFolderName(id: string, name: string) {
  const query = `UPDATE vault_folders SET name = ? WHERE id = ?`
  await db.executeSql(query, [name, id])
}

export async function GetVaultFolder(id: string): Promise<VaultFolder | null> {
  const query = `SELECT id, name, "order" FROM vault_folders WHERE id = ?`
  const { rows } = await db.executeSql(query, [id])
  if (!rows || rows.length === 0) {
    return null
  }
  const row = rows[0]
  return {
    ID: row.id,
    Name: row.name,
    Order: row.order,
  }
}

export async function UpdateVaultFolderOrder(id: string, order: number) {
  const query = `UPDATE vault_folders SET "order" = ? WHERE id = ?`
  await db.executeSql(query, [order, id])
}

export async function GetVaultFolders(): Promise<VaultFolder[]> {
  const query = `SELECT id, name, "order" FROM vault_folders ORDER BY "order"`
  const { rows } = await db.executeSql(query, [])
  if (!rows) return []
  return rows.map((r: any) => ({
    ID: r.id,
    Name: r.name,
    Order: r.order,
  }))
}

export async function DeleteVaultFolder(id: string): Promise<void> {
  await db.executeSql(
    `UPDATE vaults SET folder_id = NULL WHERE folder_id = ?`,
    [id]
  )

  await db.executeSql(`DELETE FROM vault_folders WHERE id = ?`, [id])
}

// ------------------------------------
//  Address Book
// ------------------------------------
export async function SaveAddressBookItem(
  item: AddressBookItem
): Promise<string> {
  if (!item.ID) {
    item.ID = uuidv4()
  }
  const query = `
    INSERT OR REPLACE INTO address_book (id, title, address, chain, "order")
    VALUES (?, ?, ?, ?, ?)
  `
  await db.executeSql(query, [
    item.ID,
    item.Title,
    item.Address,
    item.Chain,
    item.Order,
  ])
  return item.ID
}

export async function DeleteAddressBookItem(id: string) {
  const query = `DELETE FROM address_book WHERE id = ?`
  await db.executeSql(query, [id])
}

export async function UpdateAddressBookItem(item: AddressBookItem) {
  const query = `
    UPDATE address_book
    SET title = ?, address = ?, chain = ?, "order" = ?
    WHERE id = ?
  `
  await db.executeSql(query, [
    item.Title,
    item.Address,
    item.Chain,
    item.Order,
    item.ID,
  ])
}

export async function GetAllAddressBookItems(): Promise<AddressBookItem[]> {
  const query = `SELECT id, title, address, chain, "order" FROM address_book`
  const { rows } = await db.executeSql(query, [])
  if (!rows) return []
  return rows.map((r: any) => ({
    ID: r.id,
    Title: r.title,
    Address: r.address,
    Chain: r.chain,
    Order: r.order,
  }))
}

export async function GetAddressBookItems(
  chain: string
): Promise<AddressBookItem[]> {
  const query = `SELECT id, title, address, chain, "order" FROM address_book WHERE chain = ?`
  const { rows } = await db.executeSql(query, [chain])
  if (!rows) return []
  return rows.map((r: any) => ({
    ID: r.id,
    Title: r.title,
    Address: r.address,
    Chain: r.chain,
    Order: r.order,
  }))
}
