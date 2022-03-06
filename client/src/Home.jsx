import React from 'react';

const Home = ({ onStartClaim }) => (
  <div>
    <div className="center">
      <p className="title">Fuck Putin</p>
      <p className="secondary">A coin to represent your donation to the Ukraine</p>
      <button className="button" onClick={onStartClaim}>
        Claim Airdrop
      </button>
    </div>

    <img src="rainbow.png" alt="Rainbow" className="image" style={{ width: '65%' }} />
    <img src="futin.png" alt="Futin" className="image" style={{ width: '45%' }} />
  </div>
);

export default Home;
