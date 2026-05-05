export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    });
  }

  try {
    const { text, lang, gender } = await req.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // If no ElevenLabs key, return null so browser TTS is used as fallback
    if (!apiKey) {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Choose voice based on lang + gender
    // ElevenLabs voice IDs for natural voices
    const voiceMap = {
      'ne_female': 'XB0fDUnXU5powFXDhCwa', // Charlotte — works well for Nepali
      'ne_male':   'TX3LPaxmHKxFdv7VOQHJ', // Liam
      'en_female': 'EXAVITQu4vr4xnSDxMaL', // Sarah — natural
      'en_male':   'onwK4e9ZLuTAKqWW03F9', // Daniel
    };

    const key = `${lang || 'en'}_${gender || 'female'}`;
    const voiceId = voiceMap[key] || voiceMap['en_female'];

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Supports Nepali + English
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ fallback: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Stream audio back
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
