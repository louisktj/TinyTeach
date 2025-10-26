

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AGE_RANGES, VOICE_TONES, BACKGROUND_MUSIC } from '../constants';
import { StoryResult, QuizQuestion } from '../types';
import * as geminiService from '../services/geminiService';
import * as elevenLabsService from '../services/elevenLabsService';

const Spinner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center">
    <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg text-slate-700">{message}</p>
  </div>
);

const CustomAudioPlayer: React.FC<{ narrationUrl: string; backgroundMusicUrl?: string; initialVolume: number }> = ({ narrationUrl, backgroundMusicUrl, initialVolume }) => {
  const narrationRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = initialVolume;
    }
  }, [initialVolume]);

  const togglePlayPause = () => {
    const wasPlaying = isPlaying;
    setIsPlaying(!wasPlaying);
    if (!wasPlaying) {
      if (musicRef.current) {
        // This is the key fix: reset volume before playing in case it was faded out.
        musicRef.current.volume = initialVolume;
      }
      narrationRef.current?.play().catch(e => console.error("Narration play failed:", e));
      if (musicRef.current) {
        musicRef.current.play().catch(e => console.error("Music play failed:", e));
      }
    } else {
      narrationRef.current?.pause();
      musicRef.current?.pause();
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(narrationRef.current) {
      const newTime = Number(e.target.value);
      narrationRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const narrationAudio = narrationRef.current;
    const musicAudio = musicRef.current;

    const setAudioData = () => {
        if(narrationAudio && isFinite(narrationAudio.duration)) {
            setDuration(narrationAudio.duration);
        }
    };
    const setAudioTime = () => setCurrentTime(narrationAudio?.currentTime || 0);
    
    const handleNarrationEnd = () => {
      setIsPlaying(false);
      if (musicAudio) {
        // Fade out music
        let vol = musicAudio.volume;
        const fadeOut = setInterval(() => {
          if (vol > 0.1) {
            vol -= 0.1;
            musicAudio.volume = vol;
          } else {
            musicAudio.pause();
            clearInterval(fadeOut);
          }
        }, 100);
      }
    };

    narrationAudio?.addEventListener('loadedmetadata', setAudioData);
    narrationAudio?.addEventListener('timeupdate', setAudioTime);
    narrationAudio?.addEventListener('ended', handleNarrationEnd);

    return () => {
      narrationAudio?.removeEventListener('loadedmetadata', setAudioData);
      narrationAudio?.removeEventListener('timeupdate', setAudioTime);
      narrationAudio?.removeEventListener('ended', handleNarrationEnd);
    };
  }, []);

  return (
    <div className="w-full bg-white/50 rounded-lg p-3 shadow-inner flex items-center space-x-4">
      <audio ref={narrationRef} src={narrationUrl} preload="metadata"></audio>
      {backgroundMusicUrl && <audio ref={musicRef} src={backgroundMusicUrl} loop preload="metadata"></audio>}
      <button onClick={togglePlayPause} className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
      </button>
      <span className="text-sm font-mono text-slate-600">{formatTime(currentTime)}</span>
      <input
        type="range"
        value={currentTime}
        max={duration || 0}
        onChange={handleProgressChange}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        style={{
           background: `linear-gradient(to right, #a855f7 ${ (currentTime / duration) * 100 }%, #e2e8f0 ${ (currentTime / duration) * 100 }%)`
        }}
      />
      <span className="text-sm font-mono text-slate-600">{formatTime(duration)}</span>
    </div>
  );
};


const initialQuizState = {
  currentIndex: 0,
  selectedAnswer: null,
  feedback: null,
  isCorrect: null,
  completed: false,
};

const StoryGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('sharing toys with friends');
  const [ageRange, setAgeRange] = useState<string>(AGE_RANGES[0].value);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [tone, setTone] = useState<string>(VOICE_TONES[0]);

  const [useBackgroundMusic, setUseBackgroundMusic] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.2);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryResult | null>(null);
  const [quizState, setQuizState] = useState<{
    currentIndex: number;
    selectedAnswer: string | null;
    feedback: string | null;
    isCorrect: boolean | null;
    completed: boolean;
  }>(initialQuizState);

  const handleGenerate = useCallback(async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    
    setLoadingMessage('Crafting your story and quiz...');
    setError(null);
    setResult(null);
    setQuizState(initialQuizState);

    try {
      const { story: storyParts, voiceDescription, styleGuide, quiz } = await geminiService.generateStoryAndImagePrompts(topic, ageRange, gender, tone);

      setLoadingMessage('Choosing the perfect narrator...');
      
      const allVoices = await elevenLabsService.getVoices();
      const filteredVoices = allVoices.filter(voice => voice.labels.gender === gender);
      if (filteredVoices.length === 0) {
          throw new Error(`No ${gender} voices found from our voice provider. Please try the other option.`);
      }
      const voiceId = await geminiService.selectBestElevenLabsVoice(filteredVoices, voiceDescription);

      setLoadingMessage('Painting the pictures and warming up the narrator...');
      
      const imagePromises = storyParts.map(part => geminiService.generateImage(part.imagePrompt, styleGuide));
      const fullStoryText = storyParts.map(part => part.paragraph).join('\n\n');
      const audioPromise = elevenLabsService.generateAudio(fullStoryText, voiceId, tone);

      const [images, narrationUrl] = await Promise.all([
        Promise.all(imagePromises),
        audioPromise
      ]);
      
      const storyResultParts = storyParts.map((part, index) => ({
        paragraph: part.paragraph,
        image: images[index]
      }));
      
      const musicUrl = useBackgroundMusic ? BACKGROUND_MUSIC[tone]?.[0]?.url : undefined;
      
      setResult({ parts: storyResultParts, narrationUrl, backgroundMusicUrl: musicUrl, quiz });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoadingMessage(null);
    }
  }, [topic, ageRange, gender, tone, useBackgroundMusic]);
  
  const handleQuizSubmit = useCallback(() => {
    if (!result || quizState.selectedAnswer === null) return;
  
    const currentQuestion = result.quiz[quizState.currentIndex];
    const isAnswerCorrect = quizState.selectedAnswer === currentQuestion.correctAnswer;
  
    if (isAnswerCorrect) {
      setQuizState(prev => ({ ...prev, feedback: 'Correct!', isCorrect: true }));
      setTimeout(() => {
        if (quizState.currentIndex < result.quiz.length - 1) {
          setQuizState(prev => ({
            ...prev,
            currentIndex: prev.currentIndex + 1,
            selectedAnswer: null,
            feedback: null,
            isCorrect: null,
          }));
        } else {
          setQuizState(prev => ({ ...prev, completed: true, feedback: 'Quiz complete! Well done!' }));
        }
      }, 1500);
    } else {
      setQuizState(prev => ({ ...prev, feedback: 'Not quite, try again!', isCorrect: false }));
    }
  }, [result, quizState.currentIndex, quizState.selectedAnswer]);
  
  const handleQuizRetry = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: null,
      feedback: null,
      isCorrect: null,
    }));
  }, []);

  const getButtonClass = (option: string) => {
    const baseClass = "w-full text-left p-3 rounded-lg border-2 transition-all duration-200 text-slate-700";
    if (quizState.isCorrect === null) { // Before submission
        return `${baseClass} ${quizState.selectedAnswer === option ? 'bg-purple-200 border-purple-400' : 'bg-white/70 border-slate-300 hover:bg-purple-100'}`;
    } else { // After submission
        const isSelected = quizState.selectedAnswer === option;
        if(isSelected && !quizState.isCorrect) return `${baseClass} bg-red-300 border-red-500`; // Incorrectly selected
        if(option === result?.quiz[quizState.currentIndex].correctAnswer) return `${baseClass} bg-green-300 border-green-500`; // The correct answer
        return `${baseClass} bg-slate-200 border-slate-300 opacity-60`; // Other options
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="topic" className="block text-sm font-medium text-slate-600 mb-2">Story Topic</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Learning to be brave"
              className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-slate-600 mb-2">Age Range</label>
            <select
              id="ageRange"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              {AGE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-2">Narrator</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              <option value="female">Woman</option>
              <option value="male">Man</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-slate-600 mb-2">Voice Tone</label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              {VOICE_TONES.map((toneItem) => (
                <option key={toneItem} value={toneItem}>{toneItem}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="backgroundMusic" className="block text-sm font-medium text-slate-600 mb-2">Background Music</label>
            <select
              id="backgroundMusic"
              value={useBackgroundMusic ? 'yes' : 'no'}
              onChange={(e) => setUseBackgroundMusic(e.target.value === 'yes')}
              className="w-full bg-white/50 border border-slate-300 text-slate-800 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              <option value="no">No</option>
              <option value="yes">Yes (Auto-generated by tone)</option>
            </select>
          </div>
          <div className={`transition-opacity ${!useBackgroundMusic ? 'opacity-50' : ''}`}>
            <label htmlFor="musicVolume" className="block text-sm font-medium text-slate-600 mb-2">Music Volume</label>
             <input
              id="musicVolume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              disabled={!useBackgroundMusic}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!!loadingMessage}
          className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95 shadow-md hover:shadow-lg"
        >
          {loadingMessage ? 'Generating...' : 'Create My Story'}
        </button>
      </div>

      {loadingMessage && (
        <div className="flex justify-center my-12">
          <Spinner message={loadingMessage} />
        </div>
      )}

      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>}
      
      {result && (
        <div className="bg-white/40 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 divide-y-2 divide-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">Your Story</h2>
            <div className="max-w-3xl mx-auto mb-8">
               <CustomAudioPlayer 
                  narrationUrl={result.narrationUrl} 
                  backgroundMusicUrl={result.backgroundMusicUrl}
                  initialVolume={musicVolume}
                />
            </div>
            <div className="space-y-12 pb-8">
              {result.parts.map((part, index) => (
                <div
                  key={index}
                  style={{ animationDelay: `${index * 250}ms` }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center opacity-0 animate-fade-in"
                >
                  <div className={`rounded-lg shadow-md overflow-hidden ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                    <img
                      src={part.image}
                      alt={`Illustration ${index + 1}`}
                      className="w-full h-auto object-cover aspect-square"
                    />
                  </div>
                  <div className="flex items-center h-full">
                    <p className="text-slate-700 leading-relaxed md:text-lg">{part.paragraph}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {result.quiz && result.quiz.length > 0 && (
            <div className="pt-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">Check Your Knowledge!</h2>
              <div className="max-w-2xl mx-auto bg-white/50 p-6 rounded-lg shadow-md">
                {quizState.completed ? (
                  <div className="text-center text-2xl font-semibold text-green-600">{quizState.feedback}</div>
                ) : (
                  <>
                    <p className="text-center text-slate-600 mb-2 font-semibold">Question {quizState.currentIndex + 1} of {result.quiz.length}</p>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">{result.quiz[quizState.currentIndex].question}</h3>
                    <div className="space-y-3">
                      {result.quiz[quizState.currentIndex].options.map((option, index) => (
                        <button
                          key={index}
                          disabled={quizState.isCorrect !== null}
                          onClick={() => setQuizState(prev => ({...prev, selectedAnswer: option, feedback: null, isCorrect: null}))}
                          className={getButtonClass(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-center h-6">
                      {quizState.feedback && <p className={`font-semibold ${quizState.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{quizState.isCorrect}</p>}
                    </div>
                    <div className="mt-4">
                      {quizState.isCorrect === false ? (
                        <button
                          onClick={handleQuizRetry}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Try Again
                        </button>
                      ) : (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={quizState.selectedAnswer === null || quizState.isCorrect !== null}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;