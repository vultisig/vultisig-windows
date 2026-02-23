import { getChainFromString } from '../../utils/getChainFromString'
import { getStorageContext } from '../shared/storageContext'
import type { ToolHandler } from '../types'

export const handleGetAddressBook: ToolHandler = async () => {
  const storage = getStorageContext()

  const items = await storage.getAddressBookItems()
  const entries = items.map(item => ({
    id: item.id,
    title: item.title,
    address: item.address,
    chain: item.chain,
  }))

  return {
    data: {
      entries,
      total_count: entries.length,
    },
  }
}

export const handleAddAddressBookEntry: ToolHandler = async input => {
  const storage = getStorageContext()

  const title = String(input.title ?? input.name ?? '').trim()
  const address = String(input.address ?? '').trim()
  const chainRaw = String(input.chain ?? '').trim()

  if (!title || !address || !chainRaw) {
    throw new Error(
      `title, address, and chain are all required (got title="${title}", address="${address}", chain="${chainRaw}")`
    )
  }

  const chain = getChainFromString(chainRaw)
  if (!chain) {
    throw new Error(`Unrecognized chain: "${chainRaw}"`)
  }

  const id = crypto.randomUUID()
  await storage.createAddressBookItem({
    id,
    title,
    address,
    chain,
    order: 0,
  })

  return {
    data: {
      success: true,
      id,
      title,
      address,
      chain,
      message: `Address "${title}" saved to address book`,
    },
  }
}

export const handleRemoveAddressBookEntry: ToolHandler = async input => {
  const storage = getStorageContext()

  let id = String(input.id ?? '').trim()

  if (!id) {
    const name = String(input.name ?? input.title ?? '').trim()
    const chain = String(input.chain ?? '').trim()
    if (!name) throw new Error('name or id is required')

    const items = await storage.getAddressBookItems()
    const lowerName = name.toLowerCase()
    const matches = items.filter(item => {
      if (item.title.toLowerCase() !== lowerName) return false
      if (chain && item.chain.toLowerCase() !== chain.toLowerCase())
        return false
      return true
    })
    if (matches.length === 0)
      throw new Error(`Address book entry "${name}" not found`)
    if (matches.length > 1 && !chain) {
      const chains = matches.map(m => m.chain).join(', ')
      throw new Error(
        `Multiple entries named "${name}" found on chains: ${chains}. Specify a chain to disambiguate.`
      )
    }
    id = matches[0].id
  }

  await storage.deleteAddressBookItem(id)

  return {
    data: {
      success: true,
      id,
      message: 'Address book entry removed',
    },
  }
}
