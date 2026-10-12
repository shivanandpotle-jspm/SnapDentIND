import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let driveClient = null;

/**
 * Initialize Google Drive client using a service account.
 * Falls back gracefully if credentials are missing (dev mode).
 */
const getClient = () => {
  if (driveClient) return driveClient;

  // Check for credentials in an environment variable string first (ideal for Render/Vercel)
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  
  let authOptions;

  if (credentialsString) {
    try {
      const credentials = JSON.parse(credentialsString);
      authOptions = {
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      };
    } catch (err) {
      console.error('⚠ GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is not valid JSON.');
      return null;
    }
  } else {
    // Fallback to a local key file
    const keyPath = path.resolve(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './google-service-account.json'
    );

    if (!fs.existsSync(keyPath)) {
      console.warn('⚠ Google Drive service account key not found. Image uploads will be disabled.');
      return null;
    }
    
    authOptions = {
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    };
  }

  const auth = new google.auth.GoogleAuth(authOptions);

  driveClient = google.drive({ version: 'v3', auth });
  console.log('✓ Google Drive API connected');
  return driveClient;
};

/**
 * Upload a file buffer to Google Drive.
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - Original filename
 * @param {string} mimeType - MIME type (e.g. 'image/jpeg')
 * @returns {{ url: string, driveFileId: string }} Public URL and file ID
 */
export const uploadToDrive = async (fileBuffer, fileName, mimeType) => {
  const drive = getClient();
  if (!drive) {
    throw new Error('Google Drive is not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH.');
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const { Readable } = await import('stream');

  // Upload file
  const response = await drive.files.create({
    requestBody: {
      name: `${Date.now()}-${fileName}`,
      parents: folderId ? [folderId] : [],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id, name',
  });

  const fileId = response.data.id;

  // Make the file publicly accessible
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const url = `https://drive.google.com/uc?export=view&id=${fileId}`;

  return { url, driveFileId: fileId };
};

/**
 * Delete a file from Google Drive by its file ID.
 * @param {string} fileId - The Google Drive file ID
 */
export const deleteFromDrive = async (fileId) => {
  const drive = getClient();
  if (!drive) return;

  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error(`Failed to delete Drive file ${fileId}:`, error.message);
  }
};

export default getClient;
