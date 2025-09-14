import React from 'react';

const MobileBottomNav = ({ 
  activeTab, 
  onTabChange, 
  onMyListClick, 
  onResumeWatchingClick,
  onTrendingClick,
  onLatestClick 
}) => {
  const navItems = [
    {
      id: 'home',
      icon: 'fas fa-home',
      label: 'Home',
      onClick: () => onTabChange('home')
    },
    {
      id: 'trending',
      icon: 'fas fa-fire',
      label: 'Trending',
      onClick: onTrendingClick
    },
    {
      id: 'latest',
      icon: 'fas fa-clock',
      label: 'Latest',
      onClick: onLatestClick
    },
    {
      id: 'mylist',
      icon: 'fas fa-bookmark',
      label: 'My List',
      onClick: onMyListClick
    },
    {
      id: 'resume',
      icon: 'fas fa-play-circle',
      label: 'Resume',
      onClick: onResumeWatchingClick
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-content">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={item.onClick}
          >
            <i className={`mobile-nav-icon ${item.icon}`}></i>
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;