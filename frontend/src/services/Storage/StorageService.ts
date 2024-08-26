import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'VultisigStorageDB';

export enum StoreName {
  BALANCE = 'balance',
  SETTINGS = 'settings',
  PRICE = 'price',
}

export class StorageService<T> {
  private dbPromise: Promise<IDBPDatabase<any>> | null = null;
  private storeName: StoreName;

  constructor(storeName: StoreName) {
    this.storeName = storeName;
  }

  private async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, 2, {
        upgrade(db) {
          // Create all object stores based on the enum values
          for (const store of Object.values(StoreName)) {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store);
            }
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
