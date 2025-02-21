import SQLite, {
  openDatabase,
  SQLiteDatabase,
} from 'react-native-sqlite-storage'

SQLite.enablePromise(true)

const DB_NAME = 'vultisig.db'

export async function getDBConnection(): Promise<SQLiteDatabase> {
  const db = await openDatabase({ name: DB_NAME, location: 'default' })

  await db.executeSql('PRAGMA foreign_keys = ON;')

  return db
}
