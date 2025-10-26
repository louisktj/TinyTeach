
import React from 'react';
import SplitText from './SplitText';

const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white/60 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <SplitText
            text="About TinyTeach"
            tag="h2"
            className="text-4xl font-bold text-purple-600"
            delay={50}
            duration={0.7}
            ease="power3.out"
            splitType="chars, words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
          />
        </div>
        
        <div className="space-y-10 text-slate-700 text-lg leading-relaxed">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3 border-b-2 border-purple-200 pb-2">Our Mission</h3>
            <p>
              In a world brimming with digital distractions, we noticed a growing challenge: keeping children truly engaged in learning. TinyTeach was born from a desire to bridge the gap between education and entertainment. Our mission is to transform any subject into an unforgettable adventure, using the power of AI to create captivating, illustrated stories with rich narration. We believe that by making learning fun, we can spark a lifelong love for knowledge.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3 border-b-2 border-purple-200 pb-2">Meet the Team</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <p>
                  TinyTeach was brought to life by a passionate team of creators:
                </p>
                <ul className="list-disc list-inside mt-3 pl-4 space-y-2 font-medium">
                  <li>Louis</li>
                  <li>Samuel</li>
                  <li>Tarik</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                  <img src="/Team.png" alt="The TinyTeach Team" className="rounded-lg shadow-md w-full" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3 border-b-2 border-purple-200 pb-2">Project Context</h3>
            <p>
              This application was proudly developed as a submission for the <span className="font-semibold text-purple-600">HACK PSU Fall 2025</span> hackathon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
