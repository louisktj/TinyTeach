
// WARNING: The API key is hardcoded below for demonstration purposes based on your request.
// In a real-world application, this is a significant security risk.
// API keys should be stored securely in environment variables on a backend server
// and not exposed in frontend code.
const ELEVENLABS_API_KEY = "sk_aac99de129bdbfafba38ce87c9126a97ed58fc213bbe8d08";

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels: {
    gender?: 'male' | 'female';
    [key: string]: string | undefined;
  };
}

export const getVoices = async (): Promise<ElevenLabsVoice[]> => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });
    if (!response.ok) {
      let errorMessage = `ElevenLabs API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("ElevenLabs API Error:", errorData);
        if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
            } else if (errorData.detail.message) {
                errorMessage = errorData.detail.message;
            }
        }
      } catch (e) {
        errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}. Could not parse error response.`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.voices as ElevenLabsVoice[];
  } catch (error) {
    console.error("Error fetching ElevenLabs voices:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to fetch narrator voices.");
  }
};

export const generateAudio = async (text: string, voiceId: string, tone: string): Promise<string> => {
  let stability = 0.5;
  let similarity_boost = 0.75;
  let voicePromptPrefix = "";

  // Adjust voice settings AND add a text prompt for more expressive output
  switch (tone) {
    case 'Calm':
      stability = 0.7;
      similarity_boost = 0.8;
      voicePromptPrefix = "[narration, calm and soothing] ";
      break;
    case 'Wise':
      stability = 0.7;
      similarity_boost = 0.8;
      voicePromptPrefix = "[narration, wise and gentle] ";
      break;
    case 'Energetic':
      stability = 0.4;
      similarity_boost = 0.6;
      voicePromptPrefix = "[narration, energetic and excited] ";
      break;
    case 'Dramatic':
      stability = 0.4;
      similarity_boost = 0.6;
      voicePromptPrefix = "[narration, dramatic and expressive] ";
      break;
    case 'Mysterious':
      stability = 0.45;
      similarity_boost = 0.8;
      voicePromptPrefix = "[narration, mysterious and suspenseful] ";
      break;
    case 'Cheerful':
      stability = 0.55;
      similarity_boost = 0.7;
      voicePromptPrefix = "[narration, cheerful and bright] ";
      break;
    case 'Friendly':
      stability = 0.55;
      similarity_boost = 0.7;
      voicePromptPrefix = "[narration, friendly and warm] ";
      break;
    default:
      // Keep default values for unhandled tones
      break;
  }

  const finalText = voicePromptPrefix + text;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: finalText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: stability,
          similarity_boost: similarity_boost,
        },
      }),
    });

    if (!response.ok) {
        let errorMessage = `ElevenLabs TTS error: ${response.statusText}`;
        const errorBody = await response.text();
        console.error("ElevenLabs TTS Error:", errorBody);
        try {
            const errorData = JSON.parse(errorBody);
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (errorData.detail.message) {
                    errorMessage = errorData.detail.message;
                }
            }
        } catch (e) {
            if (errorBody) {
                 errorMessage = `ElevenLabs TTS error: ${response.statusText}. Details: ${errorBody}`;
            }
        }
        throw new Error(errorMessage);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("Error generating audio:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to generate audio narration.");
  }
};
