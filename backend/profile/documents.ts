import { api, APIError } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { getAuthData } from "~encore/auth";
import { db } from "./encore.service";

const documentsBucket = new Bucket("user-documents");

export interface Document {
  id: string;
  user_id: string;
  nome: string;
  tipo: "pessoais" | "aleatorios" | "holerites";
  arquivo_url: string;
  tamanho: number;
  mime_type: string;
  created_at: Date;
}

export interface UploadDocumentRequest {
  nome: string;
  tipo: "pessoais" | "aleatorios" | "holerites";
  arquivo_base64: string;
  mime_type: string;
}

export interface DocumentsResponse {
  documents: Document[];
}

// Uploads a new document for the authenticated user.
export const uploadDocument = api<UploadDocumentRequest, Document>(
  { auth: true, expose: true, method: "POST", path: "/documents" },
  async (req) => {
    const auth = getAuthData()!;
    const user_id = auth.userID;
    const id = `doc_${Date.now()}`;
    const now = new Date();
    
    // Convert base64 to buffer
    const buffer = Buffer.from(req.arquivo_base64, 'base64');
    const fileName = `${user_id}/${req.tipo}/${id}_${req.nome}`;
    
    // Upload to object storage
    await documentsBucket.upload(fileName, buffer, {
      contentType: req.mime_type
    });
    
    const arquivo_url = `documents/${fileName}`;
    
    const document = await db.queryRow<Document>`
      INSERT INTO documents (
        id, user_id, nome, tipo, arquivo_url, tamanho, mime_type, created_at
      )
      VALUES (
        ${id}, ${user_id}, ${req.nome}, ${req.tipo}, 
        ${arquivo_url}, ${buffer.length}, ${req.mime_type}, ${now}
      )
      RETURNING *
    `;

    return document!;
  }
);

// Retrieves authenticated user's documents by type.
export const getMyDocuments = api<{ tipo?: string }, DocumentsResponse>(
  { auth: true, expose: true, method: "GET", path: "/documents/me" },
  async ({ tipo }) => {
    const auth = getAuthData()!;
    const user_id = auth.userID;
    let query = `SELECT * FROM documents WHERE user_id = ${user_id}`;
    
    if (tipo) {
      query += ` AND tipo = '${tipo}'`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const documents = await db.queryAll<Document>(query as any);
    return { documents };
  }
);

// Deletes a document, checking for ownership.
export const deleteDocument = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/documents/:id" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get document info first to check ownership and get file path
    const document = await db.queryRow<Document>`
      SELECT * FROM documents WHERE id = ${req.id}
    `;
    
    if (!document) {
      throw APIError.notFound("document not found");
    }

    if (document.user_id !== auth.userID) {
      throw APIError.permissionDenied("you are not authorized to delete this document");
    }
    
    // Remove from object storage
    const fileName = document.arquivo_url.replace('documents/', '');
    await documentsBucket.remove(fileName);
    
    // Remove from database
    await db.exec`DELETE FROM documents WHERE id = ${req.id}`;
  }
);

// Downloads a document, checking for ownership.
export const downloadDocument = api<{ id: string }, { url: string }>(
  { auth: true, expose: true, method: "GET", path: "/documents/:id/download" },
  async (req) => {
    const auth = getAuthData()!;
    
    const document = await db.queryRow<Document>`
      SELECT * FROM documents WHERE id = ${req.id}
    `;
    
    if (!document) {
      throw APIError.notFound("document not found");
    }

    if (document.user_id !== auth.userID) {
      throw APIError.permissionDenied("you are not authorized to download this document");
    }
    
    const fileName = document.arquivo_url.replace('documents/', '');
    const signedUrl = await documentsBucket.signedDownloadUrl(fileName, { ttl: 3600 });
    
    return { url: signedUrl.url };
  }
);
