import SQLite from 'react-native-sqlite-storage'

export type Migration = {
  version: number
  up: (db: SQLite.SQLiteDatabase) => Promise<void>
}

class MigrationManager {
  private db: SQLite.SQLiteDatabase
  private migrations: Migration[]

  constructor(db: SQLite.SQLiteDatabase, migrations: Migration[]) {
    this.db = db
    this.migrations = migrations.sort((a, b) => a.version - b.version)
  }

  private async getCurrentVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS Version (key TEXT PRIMARY KEY, value TEXT);',
          [],
          () => {
            tx.executeSql(
              'SELECT value FROM Version WHERE key = "schema_version";',
              [],
              (_, result) => {
                if (result.rows.length > 0) {
                  resolve(parseInt(result.rows.item(0).value, 10))
                } else {
                  tx.executeSql(
                    'INSERT INTO Version (key, value) VALUES ("schema_version", "0");',
                    [],
                    () => resolve(0),
                    (_, error) => reject(error)
                  )
                }
              },
              (_, error) => reject(error)
            )
          },
          (_, error) => reject(error)
        )
      })
    })
  }

  private async setCurrentVersion(version: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE Version SET value = ? WHERE key = "schema_version";',
          [version.toString()],
          () => resolve(),
          (_, error) => reject(error)
        )
      })
    })
  }

  public async migrate(): Promise<void> {
    const currentVersion = await this.getCurrentVersion()
    for (const migration of this.migrations) {
      if (migration.version > currentVersion) {
        await migration.up(this.db)
        await this.setCurrentVersion(migration.version)
      }
    }
  }
}

export default MigrationManager
