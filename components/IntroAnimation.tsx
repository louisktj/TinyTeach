import React, { useState, useEffect } from 'react';

// FIX: Corrected image paths to be absolute. This resolves the "Failed to resolve module specifier"
// error by telling the browser to load the images from the root of the site, assuming they are
// in the 'public' directory, which is standard for Vite projects.
const owlWingsUp = '/owl-wings-up.png';
const owlWingsDown = '/owl-wings-down.png';
const owlLanding = '/owl-landing.png';
const owlResting = '/owl-resting.png';

interface IntroAnimationProps {
    playKey: number;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ playKey }) => {
    const [owlSrc, setOwlSrc] = useState(owlWingsUp);

    useEffect(() => {
        // Reset to initial state for animation restart
        setOwlSrc(owlWingsUp);

        // Phase 1: Flying - Flap wings
        const flapInterval = setInterval(() => {
            setOwlSrc(prevSrc => (prevSrc === owlWingsUp ? owlWingsDown : owlWingsUp));
        }, 200);

        // Phase 2: Landing
        const landingTimeout = setTimeout(() => {
            clearInterval(flapInterval);
            setOwlSrc(owlLanding);
        }, 1500);

        // Phase 3: Resting
        const restingTimeout = setTimeout(() => {
            setOwlSrc(owlResting);
        }, 1800);

        // Cleanup function to clear timers
        return () => {
            clearInterval(flapInterval);
            clearTimeout(landingTimeout);
            clearTimeout(restingTimeout);
        };
    }, [playKey]); // Rerun effect when playKey changes

    return (
        <div className="owl-container" key={playKey}>
            <img className="owl-img" src={owlSrc} alt="TinyTeach mascot" />
        </div>
    );
};

export default IntroAnimation;