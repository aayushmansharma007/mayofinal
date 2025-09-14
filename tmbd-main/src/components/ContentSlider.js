import React, { useRef } from 'react';
import ContentCard from './ContentCard';

const ContentSlider = ({ title, animeList, onCardClick }) => {
  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    const scrollAmount = 220; // Adjusted for smaller card size (200px + 20px gap)
    if (sliderRef.current) {
      if (direction === 'left') {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (!animeList || animeList.length === 0) {
    return (
      <section className="content-row">
        <h2 className="row-title">{title}</h2>
        <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>
          No anime available for {title}
        </div>
      </section>
    );
  }

  return (
    <section className="content-row">
      <h2 className="row-title">{title}</h2>
      <div className="content-section">
        <button className="slider-arrow left" onClick={() => scrollSlider('left')}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="content-slider" ref={sliderRef}>
          {animeList.map((anime, index) => (
            <ContentCard key={index} anime={anime} onClick={onCardClick} />
          ))}
        </div>
        <button className="slider-arrow right" onClick={() => scrollSlider('right')}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>
  );
};

export default ContentSlider;