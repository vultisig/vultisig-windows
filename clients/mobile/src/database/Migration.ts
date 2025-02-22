import { DB, ItMigration } from 'react-native-sqlite-manager'

import migration1 from './migrations/1'

export default class Migration extends ItMigration {
  async onCreate(db: DB) {
    await db.executeSql(migration1.up)
  }

  async onUpdate(db: DB, oldVersion: number, _newVersion: number) {
    if (oldVersion < 2) {
      await db.executeSql(`
        ALTER TABLE coins ADD COLUMN description TEXT DEFAULT '';
      `)
    }
  }
}
