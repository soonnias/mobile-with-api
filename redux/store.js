import { applyMiddleware, compose } from 'redux';
import { legacy_createStore as createStore } from 'redux';

import rootReducer from './reducers/rootReducer';
import {thunk} from "redux-thunk";


// Для React Native, заміняємо compose на пусту функцію, якщо не використовуємо devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
);

export default store;
