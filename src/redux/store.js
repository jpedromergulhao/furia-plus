import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
import { combineReducers } from "redux";
import userReducer from "../slices/userSlice"; 

const rootReducer = combineReducers({
  user: userReducer,
});

// Configuração do persist
const persistConfig = {
  key: "root",
  storage,
};

// Aplica persistência ao rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Cria a store já com persistência
export const store = configureStore({
  reducer: persistedReducer,
});

// Cria o persistor
export const persistor = persistStore(store);
