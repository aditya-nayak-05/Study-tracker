// IndexedDB storage helper for PDF documents and note data

const DB_NAME = 'StudyTrackerPdfDB';
const DB_VERSION = 1;
const DOCS_STORE = 'pdf_documents';
const FILES_STORE = 'pdf_files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update a PDF document record
 * @param {Object} docData - Metadata (id, title, pageCount, pages, notes, createdAt, updatedAt)
 * @param {Blob|File|null} fileBlob - Binary PDF file blob
 */
export async function savePdfDocument(docData, fileBlob = null) {
  try {
    const db = await openDB();
    const tx = db.transaction([DOCS_STORE, FILES_STORE], 'readwrite');
    const docsStore = tx.objectStore(DOCS_STORE);
    const filesStore = tx.objectStore(FILES_STORE);

    docsStore.put(docData);

    if (fileBlob) {
      filesStore.put({ id: docData.id, blob: fileBlob });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(docData.id);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save PDF document in IndexedDB:', err);
    throw err;
  }
}

/**
 * Fetch all stored PDF document metadata records
 */
export async function getAllPdfDocuments() {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readonly');
    const store = tx.objectStore(DOCS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get PDF documents from IndexedDB:', err);
    return [];
  }
}

/**
 * Fetch a single PDF document metadata and binary file blob
 */
export async function getPdfDocument(id) {
  try {
    const db = await openDB();
    const tx = db.transaction([DOCS_STORE, FILES_STORE], 'readonly');
    const docsStore = tx.objectStore(DOCS_STORE);
    const filesStore = tx.objectStore(FILES_STORE);

    const docReq = docsStore.get(id);
    const fileReq = filesStore.get(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        const doc = docReq.result;
        if (!doc) resolve(null);
        else resolve({ ...doc, blob: fileReq.result ? fileReq.result.blob : null });
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`Failed to get PDF document ${id} from IndexedDB:`, err);
    return null;
  }
}

/**
 * Delete a PDF document and its binary file blob
 */
export async function deletePdfDocument(id) {
  try {
    const db = await openDB();
    const tx = db.transaction([DOCS_STORE, FILES_STORE], 'readwrite');
    tx.objectStore(DOCS_STORE).delete(id);
    tx.objectStore(FILES_STORE).delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`Failed to delete PDF document ${id}:`, err);
    return false;
  }
}
