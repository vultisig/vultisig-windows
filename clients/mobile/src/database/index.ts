import SQLite from 'react-native-sqlite-storage'

import MigrationManager, { Migration } from './MigrationManager'
import migration1 from './migrations/1'
const DATABASE_NAME = 'vultisig.db'

const initializeDatabase = async (): Promise<void> => {
  const db = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  })

  const migrations: Migration[] = [migration1]
  const migrationManager = new MigrationManager(db, migrations)

  try {
    await migrationManager.migrate()
    console.log('Database initialized and migrated successfully')
  } catch (error) {
    console.error('Database migration failed', error)
  }
}

export default initializeDatabase
