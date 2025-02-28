import { applyMiddleware, compose } from "redux";
import { legacy_createStore as createStore } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers/rootReducer";

// Для React Native прибираємо Redux DevTools
const composeEnhancers = compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export default store;
