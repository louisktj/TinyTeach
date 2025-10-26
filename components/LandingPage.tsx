import React from 'react';
import SplitText from './SplitText';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="text-center animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-lg">
        <SplitText
          text="Turn Learning into an Adventure"
          tag="h2"
          className="text-4xl md:text-5xl font-bold text-purple-600 mb-8"
          delay={50}
          duration={0.7}
          ease="power3.out"
          splitType="chars, words"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
        />
        <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          In a world full of distractions, keeping children engaged is a challenge. TinyTeach transforms any topic into a magical, illustrated, and narrated story, making education fun, memorable, and captivating.
        </p>

        <div className="my-12">
          <h3 className="text-2xl font-bold text-slate-700 mb-6">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="h-24 mb-3 flex items-center">
                <img src="/Pick.png" alt="A hand picking a topic from a list" className="max-h-full" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">1. Pick a Topic</h4>
              <p className="text-slate-500 text-sm">Enter any subject you want to teach, from sharing toys to the solar system.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 mb-3 flex items-center">
                <img src="/GenerateMagic.png" alt="A magic wand generating a story book" className="max-h-full" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">2. Generate Magic</h4>
              <p className="text-slate-500 text-sm">Our AI crafts a unique story with beautiful illustrations and a professional narrator.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-24 mb-3 flex items-center">
                <img src="/Listen.png" alt="An owl wearing headphones and listening" className="max-h-full" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">3. Listen & Learn</h4>
              <p className="text-slate-500 text-sm">Enjoy an immersive audio-visual experience that makes learning stick.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg transition-transform transform active:scale-95 shadow-lg hover:shadow-xl text-lg"
        >
          Create Your First Story
        </button>
      </div>
    </div>
  );
};

export default LandingPage;