import React from 'react';
import './App.css';

import SurroundSoundLogo from './assets/images/logos/surround-sound.svg';
import Window from './components/Window';

function App() {
  return (
    <div className="app">
      <Window icon={SurroundSoundLogo} width={600} height={600} />
    </div>
  );
}

export default App;
