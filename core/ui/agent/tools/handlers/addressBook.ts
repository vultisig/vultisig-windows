import { getChainFromString } from '../../utils/getChainFromString'
import type { ToolHandler } from '../types'

export const handleGetAddressBook: ToolHandler = async () => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const items = await store.GetAllAddressBookItems()
  const entries = (items ?? []).map(item => ({
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
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const title = String(input.title ?? input.name ?? '').trim()
  const address = String(input.address ?? '').trim()
  const chainRaw = String(input.chain ?? '').trim()

  if (!title || !address || !chainRaw) {
    throw new Error(
      `title, address, and chain are all required (got title="${title}", address="${address}", chain="${chainRaw}")`
    )
  }

  const chain = getChainFromString(chainRaw) ?? chainRaw

  const id = crypto.randomUUID()
  await store.SaveAddressBookItem({
    id,
    title,
    address,
    chain,
    order: 0,
  } as never)

  if (window.runtime) {
    window.runtime.EventsEmit('addressbook:changed')
  }

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
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  let id = String(input.id ?? '').trim()

  if (!id) {
    const name = String(input.name ?? input.title ?? '').trim()
    const chain = String(input.chain ?? '').trim()
    if (!name) throw new Error('name or id is required')

    const items = await store.GetAllAddressBookItems()
    const lowerName = name.toLowerCase()
    const match = (items ?? []).find(item => {
      if (item.title.toLowerCase() !== lowerName) return false
      if (chain && item.chain.toLowerCase() !== chain.toLowerCase())
        return false
      return true
    })
    if (!match) throw new Error(`Address book entry "${name}" not found`)
    id = match.id
  }

  await store.DeleteAddressBookItem(id)

  if (window.runtime) {
    window.runtime.EventsEmit('addressbook:changed')
  }

  return {
    data: {
      success: true,
      id,
      message: 'Address book entry removed',
    },
  }
}
