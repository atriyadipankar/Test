import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';
import { z } from 'zod';
import { NextRequest } from 'next/server';

const es = initEdgeStore.create();

/**
 * This is the main router for the EdgeStore API
 */
const edgeStoreRouter = es.router({
  // Define a public bucket for dataset files
  datasetFiles: es.fileBucket()
    .input(
      z.object({
        // You can add custom input validation and metadata
        type: z.enum(['csv', 'excel', 'json', 'txt', 'other']).optional(),
        description: z.string().optional(),
      })
    )
    .path(() => [
      {
        // Save files using a timestamp and unique ID
        directory: () => 'datasets',
        prefix: () => `${Date.now().toString()}-`,
      },
    ]),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

export type EdgeStoreRouter = typeof edgeStoreRouter;
