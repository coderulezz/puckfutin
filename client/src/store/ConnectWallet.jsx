import React, { useContext } from 'react';
import { Context } from './Store';

const ConnectWallet = ({ text = 'Connect Wallet' }) => {
  const [state] = useContext(Context);

  return (
    <>
      <button
        className="button small-button"
        onClick={state.connect}
        disabled={state.error || state.account}
      >
        {state.error ? state.error : state.account ? state.account.minAddress : text}
      </button>
      {state.account && (
        <button
          style={{ fontSize: 16, fontFamily: 'Heebo', cursor: 'pointer' }}
          className="btn btn-link"
          onClick={state.disconnect}
        >
          Disconnect
        </button>
      )}
    </>
  );
};

export default ConnectWallet;
