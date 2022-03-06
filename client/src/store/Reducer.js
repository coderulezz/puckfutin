const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNT':
      const address = action.payload.wallet;
      return {
        ...state,
        account: {
          ...action.payload,
          minAddress:
            address.substring(0, 4) + '....' + address.substring(address.length - 5)
        }
      };
    case 'CLEAR_ACCOUNT':
      return {
        ...state,
        account: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_CONNECTION':
      return {
        ...state,
        connect: action.payload
      };
    case 'SET_DISCONNECTION':
      return {
        ...state,
        disconnect: action.payload
      };
    case 'SET_CONTRACT':
      return {
        ...state,
        contract: action.payload
      };
    default:
      return state;
  }
};

export default Reducer;
