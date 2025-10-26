# 🧠 TinyTeach, Turning Learning into an Adventure

TinyTeach transforms any topic into a magical, illustrated, and narrated story — making education fun, memorable, and accessible for children.

## 🌟 Inspiration
We noticed that children are constantly surrounded by distractions, making it difficult for parents and teachers to keep them engaged. TinyTeach was created to bridge the gap between **education and entertainment**, turning learning into a joyful experience through storytelling, art, and voice.

## 💡 What It Does
TinyTeach lets users input any topic (e.g., "sharing toys" or "the solar system").  
Then, our app:
1. Uses **Gemini AI** to write an age-appropriate story and generate up to 4 illustrations.
2. Uses **ElevenLabs** to narrate the story with expressive voices and background music.
3. Presents an immersive audio-visual experience that makes learning stick.

## 🛠️ Tech Stack
- **Frontend:** Next.js, TypeScript, React, TailwindCSS  
- **Backend:** Next.js API Routes (TypeScript)
- **AI Integration:**
  - **Google Gemini API** – for text & image generation  
  - **ElevenLabs API** – for voice, music, and sound effects  
- **Hosting:** [Vultr](https://www.vultr.com)  
- **Domain:** `.tech` domain (TinyTeach.tech)  
- **Storage:** Cloud-hosted assets for fast and reliable delivery

## ⚙️ Features
- Age-based storytelling (3–18 years)
- Multiple voice tones (Friendly, Calm, Energetic, Wise, Mysterious, Cheerful, Dramatic)
- Illustrated scenes generated dynamically
- Narration with optional background music
- Web-friendly and optimized for fast rendering

## 🚀 How We Built It
We used **Next.js + TypeScript** to ensure scalability and maintainability.  
Vite handles static asset bundling for audio and images, while React Query manages API requests.  
Gemini powers story and image generation, and ElevenLabs provides text-to-speech, sound effects, and background music.

## 🧩 Challenges
- Synchronizing multiple API calls (text → image → audio).  
- Ensuring voice tone and pacing matched the story’s age group.  
- Maintaining consistent illustration styles.  
- Handling audio playback smoothly across devices.

## 🏆 Accomplishments
- Built a complete AI storytelling pipeline connecting Gemini and ElevenLabs.  
- Deployed successfully on **Vultr** with a custom **.tech domain**.  
- Created custom voice profiles for different story moods and ages.  
- Delivered an engaging, kid-friendly UI that feels magical.

## 📚 What We Learned
- How to combine multimodal AI models effectively.  
- The importance of **UX** and **emotional design** in educational products.  
- How to manage asset generation pipelines and handle API rate limits efficiently.

## 🔮 What’s Next
- Add multi-language support (English, French, Spanish).  
- Develop a mobile/tablet version for classrooms.  
- Introduce user accounts for saving and replaying stories.  
- Add emotional voice adaptation and music mixing tools.

## 🧑‍💻 Team
- AI Integration & Backend: Gemini + ElevenLabs APIs  
- Frontend & UI Design: Next.js + TailwindCSS  
- Deployment: Vultr  
- Domain: TinyTeach.tech

---

✨ **TinyTeach** — Making learning feel like magic ✨  
[Visit TinyTeach.tech](http://tinyteach.tech)
