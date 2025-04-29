import React from 'react';
import './LoadingScreen.css'; 
import scratch from '../../assets/scratch.svg'; 

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img src={scratch} alt="Rasgo de garras" className="scratch-animation" />
    </div>
  );
}

export default LoadingScreen;
