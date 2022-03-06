import React, { useState } from 'react';
import Store from './store/Store';
import Claim from './Claim';
import Home from './Home';

import './App.css';

const App = () => {
  const [claiming, setClaiming] = useState(true);

  return (
    <Store>
      {claiming ? <Claim /> : <Home onStartClaim={() => setClaiming(true)} />}
    </Store>
  );
};

export default App;
