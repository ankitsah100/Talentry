export const config = { runtime: 'edge' };

export default async function handler(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  return new Response(JSON.stringify({
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    env: 'edge'
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
