export interface GeneratedStoryPart {
  paragraph: string;
  imagePrompt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StoryGenerationResponse {
  story: GeneratedStoryPart[];
  voiceDescription: string;
  styleGuide: string;
  quiz: QuizQuestion[];
}

export interface StoryResult {
  parts: {
    paragraph: string;
    image: string;
  }[];
  narrationUrl: string;
  backgroundMusicUrl?: string;
  quiz: QuizQuestion[];
}

// FIX: Removed the module declaration for '*.mp3'. It was conflicting with
// Vite's default client types, which already declare modules for assets like MP3 files.
// This duplicate declaration caused the build errors.
