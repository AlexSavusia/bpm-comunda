import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter} from "react-router";
import "admin-lte/dist/css/adminlte.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

import "./i18n";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>,
)
