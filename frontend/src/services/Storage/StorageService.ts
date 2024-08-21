import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'VultisigStorageDB';

export enum StoreName {
  BALANCE = 'balance',
  SETTINGS = 'settings',
}

export class StorageService<T> {
  private dbPromise: Promise<IDBPDatabase<any>> | null = null;
  private storeName: StoreName;

  constructor(storeName: StoreName) {
    this.storeName = storeName;
  }

  private async getDB() {
    if (!this.dbPromise) {
      const storeName = this.storeName;
      this.dbPromise = openDB(DB_NAME, 1, {
        upgrade(db) {
          // Create object stores dynamically based on the enum
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveToStorage(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    await db.put(this.storeName, value, key);
  }

  async getFromStorage(key: string): Promise<T | null> {
    const db = await this.getDB();
    return await db.get(this.storeName, key);
  }

  async removeFromStorage(key: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.storeName, key);
  }

  async clearStorage(): Promise<void> {
    const db = await this.getDB();
    await db.clear(this.storeName);
  }
}
