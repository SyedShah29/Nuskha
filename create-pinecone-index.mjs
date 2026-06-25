// Script to create the Pinecone medical-fast-search index
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'medical-fast-search';

async function createIndex() {
  console.log(`Creating Pinecone index: ${INDEX_NAME}...`);

  // Check if index already exists
  const { indexes } = await pinecone.listIndexes();
  const exists = indexes?.some(idx => idx.name === INDEX_NAME);

  if (exists) {
    console.log(`✅ Index "${INDEX_NAME}" already exists.`);
    return;
  }

  // Create serverless index (free tier)
  await pinecone.createIndex({
    name: INDEX_NAME,
    dimension: 384, // Xenova/all-MiniLM-L6-v2 produces 384-dim embeddings
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1', // Free tier default
      },
    },
  });

  console.log(`✅ Index "${INDEX_NAME}" created successfully!`);
  console.log('Note: Index may take 1-2 minutes to be ready.');
}

createIndex().catch(console.error);
