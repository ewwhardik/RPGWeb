/**
 * Karmaraj Offline-First Synchronization Engine
 * Pure TypeScript IndexedDB Transaction Outbox with Automatic Online Replay
 */

export interface OfflineAction {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: unknown;
  timestamp: number;
  retryCount: number;
  description?: string;
}

const DB_NAME = "karmaraj_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "actions_outbox";

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Queue an action for offline replay when network is restored
 */
export async function queueOfflineAction(
  action: Omit<OfflineAction, "id" | "timestamp" | "retryCount">
): Promise<OfflineAction> {
  const fullAction: OfflineAction = {
    ...action,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const db = await openDB();
  if (!db) {
    // Fallback to localStorage
    try {
      const current = JSON.parse(localStorage.getItem("karmaraj_offline_queue") || "[]");
      current.push(fullAction);
      localStorage.setItem("karmaraj_offline_queue", JSON.stringify(current));
    } catch {}
    return fullAction;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(fullAction);
      tx.oncomplete = () => resolve(fullAction);
      tx.onerror = () => resolve(fullAction);
    } catch {
      resolve(fullAction);
    }
  });
}

/**
 * Get list of all pending outbox actions
 */
export async function getPendingActions(): Promise<OfflineAction[]> {
  const db = await openDB();
  if (!db) {
    try {
      return JSON.parse(localStorage.getItem("karmaraj_offline_queue") || "[]");
    } catch {
      return [];
    }
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Remove an action after successful sync
 */
export async function removePendingAction(id: string): Promise<void> {
  const db = await openDB();
  if (!db) {
    try {
      const current: OfflineAction[] = JSON.parse(
        localStorage.getItem("karmaraj_offline_queue") || "[]"
      );
      const filtered = current.filter((a) => a.id !== id);
      localStorage.setItem("karmaraj_offline_queue", JSON.stringify(filtered));
    } catch {}
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Synchronize all pending actions with server
 */
export async function syncPendingActions(): Promise<{ synced: number; failed: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const pending = await getPendingActions();
  if (pending.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: item.payload ? JSON.stringify(item.payload) : undefined,
      });

      if (res.ok || res.status === 400 || res.status === 404) {
        // Successful or non-retriable error: remove from outbox
        await removePendingAction(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Check if the browser is currently online
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") return true;
  return navigator.onLine;
}

/**
 * Register automatic online listener to drain outbox
 */
export function setupAutoSync(onSyncComplete?: (result: { synced: number; failed: number }) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = async () => {
    const result = await syncPendingActions();
    if (onSyncComplete && result.synced > 0) {
      onSyncComplete(result);
    }
  };

  window.addEventListener("online", handleOnline);

  // Periodic safety check every 45s
  const interval = setInterval(async () => {
    if (isOnline()) {
      const result = await syncPendingActions();
      if (onSyncComplete && result.synced > 0) {
        onSyncComplete(result);
      }
    }
  }, 45000);

  return () => {
    window.removeEventListener("online", handleOnline);
    clearInterval(interval);
  };
}
