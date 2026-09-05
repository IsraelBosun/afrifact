import { buildFactsPayload } from '@/lib/studio/payloads.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await buildFactsPayload());
}
