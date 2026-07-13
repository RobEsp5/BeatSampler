/**
 * Tiny IndexedDB adapter (no dependencies) that remembers the Library
 * folder's FileSystemDirectoryHandle across sessions, so the user never
 * re-picks the folder — at most they re-grant permission (ADR 0003). No unit
 * tests by policy: this is a thin browser adapter, not domain core.
 */

const DB_NAME = "beatsampler";
const STORE_NAME = "handles";
const LIBRARY_KEY = "library-folder";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(asError(request.error));
  });
}

function inStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const request = run(tx.objectStore(STORE_NAME));
        tx.oncomplete = () => {
          db.close();
          resolve(request.result);
        };
        tx.onerror = () => {
          db.close();
          reject(asError(tx.error));
        };
      }),
  );
}

export function saveLibraryHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  return inStore("readwrite", (store) =>
    store.put(handle, LIBRARY_KEY),
  ).then(() => undefined);
}

export async function loadLibraryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const value = await inStore("readonly", (store) => store.get(LIBRARY_KEY));
    return value instanceof FileSystemDirectoryHandle ? value : null;
  } catch {
    // A broken or unavailable IndexedDB just means no remembered Library.
    return null;
  }
}

/**
 * Permission on the stored handle. Sandboxed handles (e.g. OPFS) don't expose
 * queryPermission — treat that as "granted".
 */
export async function queryHandlePermission(
  handle: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  if (typeof handle.queryPermission !== "function") {
    return "granted";
  }
  return handle.queryPermission({ mode: "readwrite" });
}

/** Must be called from a user gesture. */
export async function requestHandlePermission(
  handle: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  if (typeof handle.requestPermission !== "function") {
    return "granted";
  }
  return handle.requestPermission({ mode: "readwrite" });
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
