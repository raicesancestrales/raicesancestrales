import { google } from 'googleapis';
import fs from 'fs';

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, // debe coincidir con el JSON
  null,
  process.env.GOOGLE_PRIVATE_KEY, // 👈 sin replace
  ['https://www.googleapis.com/auth/drive']
);

const drive = google.drive({ version: 'v3', auth });

export async function subirArchivo(filePath, fileName, mimeType, folderId) {
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = response.data.id;

  // Hacer público el archivo
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const publicUrl = `https://drive.google.com/uc?id=${fileId}`;
  return publicUrl;
}
