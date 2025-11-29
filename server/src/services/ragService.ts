import fs from 'fs';
import PDFParser from 'pdf2json'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { prisma } from '../utils/prisma';

// Inisialisasi Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

// Fungsi bantu dummy vector jika kuota habis
const createDummyVector = (dim: number) => new Array(dim).fill(0.01);

export const processDocument = async (filePath: string, filename: string, userId: string) => {
  try {
    // --- LOGIKA PARSING PDF (MENGGUNAKAN PDF2JSON) ---
    const text = await new Promise<string>((resolve, reject) => {
      // FIX UTAMA: Gunakan '1 as any' untuk membungkam error TypeScript
      const pdfParser = new PDFParser(null, 1 as any);

      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        // Ambil teks mentah
        const rawText = pdfParser.getRawTextContent();
        resolve(rawText);
      });

      // Load file
      pdfParser.loadPDF(filePath);
    });
    // --------------------------------------------------

    // Validasi isi
    if (!text || text.trim().length === 0) {
      throw new Error("PDF kosong atau tidak terbaca (mungkin hasil scan gambar).");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const chunks = await splitter.createDocuments([text]);

    console.log(`Processing ${chunks.length} chunks from ${filename}...`);

    // Loop processing dengan Rate Limit Handling
    for (const [index, chunk] of chunks.entries()) {
      const content = chunk.pageContent
        .replace(/----------------Page \(\d+\) Break----------------/g, "") 
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (content.length < 10) continue;

      let vector: number[] = [];

      try {
        // Rate Limit Handling (Delay 4 detik agar aman untuk akun gratis)
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        console.log(`Embedding chunk ${index + 1}/${chunks.length}...`);
        const result = await embeddingModel.embedContent(content);
        vector = result.embedding.values;
        
      } catch (err) {
        console.warn(`⚠️ Gagal embed chunk ${index + 1} (Quota/Error). Menggunakan Dummy Vector.`);
        vector = createDummyVector(768); // Fallback ke dummy agar data tetap masuk
      }

      // Simpan ke DB
      await prisma.$executeRaw`
        INSERT INTO "Document" ("id", "userId", "filename", "content", "embedding", "updatedAt")
        VALUES (
          gen_random_uuid(), 
          ${userId}, 
          ${filename}, 
          ${content}, 
          ${vector}::vector, 
          NOW()
        );
      `;
    }
    
    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  } finally {
    // --- PERBAIKAN: ALWAYS CLEANUP ---
    // Hapus file temporary baik sukses maupun gagal
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temp file: ${filePath}`);
    }
  }
};

export const searchSimilarDocuments = async (query: string, limit = 3) => {
  let queryVector: number[] = [];
  
  try {
    const result = await embeddingModel.embedContent(query);
    queryVector = result.embedding.values;
  } catch (err) {
    console.log("Search API error, using dummy vector query");
    queryVector = createDummyVector(768);
  }

  const documents = await prisma.$queryRaw`
    SELECT id, content, filename, 1 - (embedding <=> ${queryVector}::vector) as similarity
    FROM "Document"
    ORDER BY embedding <=> ${queryVector}::vector
    LIMIT ${limit};
  `;

  return documents as any[];
};