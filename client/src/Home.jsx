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
    <div className="fixed-bottom">
      <div className="row disclaimer">
        <div className="col-md-3">
          <a
            href="https://etherscan.io/address/0xec4e62080ac205539f3096e642dd3a7acd4665d4"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 15, marginRight: 15 }}
          >
            Contract
          </a>
          |
          <a
            href="https://twitter.com/fputin_xyz/status/1500414606665457666"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 15, marginRight: 15 }}
          >
            WTF is this?
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
