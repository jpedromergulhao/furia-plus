import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { store, persistor } from "./redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import reportWebVitals from './reportWebVitals';
import { PersistGate } from "redux-persist/integration/react";

const preloader = document.getElementById('preloader');
if (preloader) {
  preloader.style.display = 'none';
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
