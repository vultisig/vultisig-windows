import { DB, ItMigration, Schema } from 'react-native-sqlite-manager'

export default class Migration extends ItMigration {
  async onCreate(db: DB) {
    const schema = new Schema(db)

    await schema.create('vaults', table => {
      table.text('name')
      table.text('public_key_ecdsa').primaryKey()
      table.text('public_key_eddsa')
      table.text('created_at')
      table.text('hex_chain_code')
      table.text('local_party_id')
      table.text('signers')
      table.text('reshare_prefix')
      table.real('order')
      table.integer('is_backedup')
      table.text('folder_id')
      table.text('lib_type')
    })

    await schema.create('vault_folders', table => {
      table.increments('id')
      table.text('name')
      table.real('order')
    })

    await schema.create('coins', table => {
      table.increments('id')
      table.text('chain')
      table.text('address')
      table.text('hex_public_key')
      table.text('ticker')
      table.text('contract_address')
      table.integer('is_native_token')
      table.text('logo')
      table.text('price_provider_id')
      table.integer('decimals')
      table.text('public_key_ecdsa')
      table.foreign('public_key_ecdsa').references('vaults', 'public_key_ecdsa')
    })
  }

  async onUpdate(db: DB, oldVersion: number, _newVersion: number) {
    const schema = new Schema(db)

    if (oldVersion < 2) {
      // @tony: Example migration for version 2: Adding some description to coins
      await schema.alter('coins', table => {
        table.text('description').default('')
      })
    }
  }
}
