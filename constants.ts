
export const AGE_RANGES = [
  { value: '3-4 years', label: 'Toddler (3-4)' },
  { value: '5-6 years', label: 'Preschool (5-6)' },
  { value: '7-8 years', label: 'Early Elementary (7-8)' },
  { value: '9-10 years', label: 'Late Elementary (9-10)' },
  { value: '11-12 years', label: 'Middle School (11-12)' },
  { value: '13-15 years', label: 'Early Teen (13-15)' },
  { value: '16-18 years', label: 'Late Teen (16-18)' },
];

export const VOICE_TONES = [
  'Friendly',
  'Calm',
  'Energetic',
  'Wise',
  'Mysterious',
  'Cheerful',
  'Dramatic',
];

// FIX: Removed direct imports for MP3 files, which were causing module resolution errors.
// The URLs now point to absolute paths, assuming the audio files are in a 'public' directory.
// This allows the app to load while still enabling background music if the files are present.
export const BACKGROUND_MUSIC: { [key: string]: { name: string; url: string }[] } = {
  Friendly: [
    { name: 'Friendly Song', url: '/Friendly.mp3' },
  ],
  Calm: [
    { name: 'Calm Melody', url: '/Calm.mp3' },
  ],
  Energetic: [
    { name: 'Energetic Beat', url: '/Energetic.mp3' },
  ],
  Wise: [
    { name: 'Wise Theme', url: '/Wise.mp3' },
  ],
  Mysterious: [
    { name: 'Mysterious Tune', url: '/Mysterious.mp3' },
  ],
  Cheerful: [
    { name: 'Cheerful Song', url: '/Cheerful.mp3' },
  ],
  Dramatic: [
    { name: 'Dramatic Score', url: '/Dramatic.mp3' },
  ],
};
