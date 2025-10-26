
import React, { useState } from 'react';
import StoryGenerator from './components/StoryGenerator';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import IntroAnimation from './components/IntroAnimation';

type Page = 'landing' | 'generator' | 'about';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  onHomeClick: () => void;
  owlAnimationKey: number;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onHomeClick, owlAnimationKey }) => {
  return (
    <header className="bg-white/70 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-slate-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-16 cursor-pointer" onClick={onHomeClick}>
          <div className="relative w-12 h-12">
             <IntroAnimation playKey={owlAnimationKey} />
          </div>
          <img src="/TinyTeach.png" alt="TinyTeach Logo" className="h-20 w-auto" />
        </div>
        <nav className="flex items-center space-x-6">
          <button onClick={onHomeClick} className="text-slate-600 hover:text-purple-600 font-semibold transition text-lg">
            Home
          </button>
          <button onClick={() => onNavigate('about')} className="text-slate-600 hover:text-purple-600 font-semibold transition text-lg">
            About
          </button>
          <button 
            onClick={() => onNavigate('generator')} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-5 rounded-lg transition-transform transform active:scale-95 shadow-sm text-lg"
          >
            Create Story
          </button>
        </nav>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('landing');
  const [animationKey, setAnimationKey] = useState(0);

  const handleNavigate = (newPage: Page) => {
    setPage(newPage);
  };

  const handleHomeClick = () => {
    setPage('landing');
    setAnimationKey(prevKey => prevKey + 1);
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage key={animationKey} onStart={() => handleNavigate('generator')} />;
      case 'generator':
        return <StoryGenerator />;
      case 'about':
        return <AboutPage />;
      default:
        return <LandingPage key={animationKey} onStart={() => handleNavigate('generator')} />;
    }
  }

  return (
    <div className="min-h-screen">
      <Header onNavigate={handleNavigate} onHomeClick={handleHomeClick} owlAnimationKey={animationKey} />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;