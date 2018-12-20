// import { browserHistory } from 'react-router'
// import { createStore, applyMiddleware, compose } from 'redux'
// import thunkMiddleware from 'redux-thunk'
// import { routerMiddleware } from 'react-router-redux'
// import reducer from './reducer'

// // Redux DevTools
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// const routingMiddleware = routerMiddleware(browserHistory)

// const store = createStore(
//   reducer,
//   composeEnhancers(
//     applyMiddleware(
//       thunkMiddleware,
//       routingMiddleware
//     )
//   )
// )

// export default store

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducer.js';

const enhancer = compose(applyMiddleware(thunk));
export default createStore(rootReducer, enhancer);
