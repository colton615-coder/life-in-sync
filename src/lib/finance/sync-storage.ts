import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

interface QueuedTransaction {
  id: string;
  amount: number;
  categoryName: string; // Using name for initial log, ID resolution happens on sync
  description: string;
  date: string; // ISO String
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

interface FinanceDB extends DBSchema {
  transaction_queue: {
    key: string;
    value: QueuedTransaction;
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'finance-v3-db';
const STORE_NAME = 'transaction_queue';

class AccountantSync {
  private dbPromise: Promise<IDBPDatabase<FinanceDB>>;

  constructor() {
    this.dbPromise = openDB<FinanceDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-status', 'status');
      },
    });
  }

  /**
   * Queues a transaction for offline/optimistic handling.
   */
  async queueTransaction(
    amount: number,
    categoryName: string,
    description: string
  ): Promise<QueuedTransaction> {
    const tx: QueuedTransaction = {
      id: uuidv4(),
      amount,
      categoryName,
      description,
      date: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    const db = await this.dbPromise;
    await db.put(STORE_NAME, tx);
    return tx;
  }

  /**
   * Retrieves all pending transactions.
   */
  async getPendingTransactions(): Promise<QueuedTransaction[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex(STORE_NAME, 'by-status', 'pending');
  }

  /**
   * Updates the status of a transaction (e.g., after successful sync).
   */
  async updateTransactionStatus(id: string, status: 'synced' | 'failed'): Promise<void> {
    const db = await this.dbPromise;
    const tx = await db.get(STORE_NAME, id);
    if (tx) {
      tx.status = status;
      await db.put(STORE_NAME, tx);
    }
  }

  /**
   * Clears synced transactions to keep the DB clean.
   */
  async clearSyncedTransactions(): Promise<void> {
    const db = await this.dbPromise;
    const synced = await db.getAllFromIndex(STORE_NAME, 'by-status', 'synced');
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([
      ...synced.map((item) => tx.store.delete(item.id)),
      tx.done
    ]);
  }

  /**
   * Flushes the queue: Retrieves pending items for processing.
   * Note: The actual API call logic will be handled by the consumer (AccountantService),
   * which will then call updateTransactionStatus.
   */
  async getQueueForFlush(): Promise<QueuedTransaction[]> {
    return this.getPendingTransactions();
  }
}

export const accountantSync = new AccountantSync();
export type { QueuedTransaction };
