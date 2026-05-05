export const config = { runtime: 'edge' };
export default async function handler(req) {
  const key = process.env.ELEVENLABS_API_KEY || '';
  return new Response(JSON.stringify({ key }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
