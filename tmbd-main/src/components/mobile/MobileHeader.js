import React, { useState } from 'react';
import logo from '../../logo/logo.png';
import MobileSearchEnhanced from './MobileSearchEnhanced';
import { forceUnlockBodyScroll } from '../../utils/scrollManager';

const MobileHeader = ({ 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  showSearchResults, 
  onSearchResultClick 
}) => {
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);

  const handleSearchTrigger = () => {
    setShowEnhancedSearch(true);
  };

  const handleSearchClose = () => {
    setShowEnhancedSearch(false);
    forceUnlockBodyScroll();
  };

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-logo">
            <img 
              src={logo} 
              alt="AnimePlex" 
              className="mobile-logo-img"
            />
          </div>
          
          <div className="mobile-search-container">
            <button 
              className="mobile-search-trigger"
              onClick={handleSearchTrigger}
            >
              <i className="fas fa-search mobile-search-icon"></i>
              <span className="mobile-search-placeholder">Search anime...</span>
            </button>
          </div>
          
          <div className="mobile-header-actions">
            <button className="mobile-header-btn">
              <i className="fas fa-user"></i>
            </button>
          </div>
        </div>
      </header>

      {showEnhancedSearch && (
        <MobileSearchEnhanced
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          onSearchResultClick={(anime) => {
            onSearchResultClick(anime);
            handleSearchClose();
          }}
          onClose={handleSearchClose}
        />
      )}
    </>
  );
};

export default MobileHeader;