import { DB } from 'react-native-sqlite-manager'

import Migration from './Migration'

const DATABASE_NAME = 'vultisig.db'
const DATABASE_VERSION = 1

export const initializeDatabase = async () => {
  const db = DB.get(DATABASE_NAME)

  try {
    await db.migrate(new Migration(), DATABASE_VERSION)
    console.log('Database initialized and migrated successfully')
  } catch (error) {
    console.error('Database migration failed', error)
  }
}
