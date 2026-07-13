/**
 * Ambient declarations for the File System Access API surface TypeScript's
 * lib.dom doesn't ship yet (Chromium-only, per ADR 0001/0003): the directory
 * picker and per-handle permission queries. `queryPermission` /
 * `requestPermission` are optional because sandboxed handles (e.g. OPFS)
 * don't expose them — callers treat a missing method as "granted".
 */

interface DirectoryPickerOptions {
  id?: string;
  mode?: "read" | "readwrite";
}

interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

interface FileSystemHandle {
  queryPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission?(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
}

interface Window {
  showDirectoryPicker(
    options?: DirectoryPickerOptions,
  ): Promise<FileSystemDirectoryHandle>;
}
