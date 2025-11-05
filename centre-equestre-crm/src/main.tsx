import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DashboardPage } from './pages/Dashboard.tsx'
import { MessagingPage } from './pages/Messaging.tsx'
import { NotFoundPage } from './pages/NotFound.tsx'
import { SchedulePage } from './pages/Schedule.tsx'
import { UsersPage } from './pages/Users.tsx'
import {PoneysPage} from './pages/Poneys.tsx';

import { CavalierPage } from './pages/Cavalier.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="utilisateurs" element={<UsersPage />} />
          <Route path="messagerie" element={<MessagingPage />} />
          <Route path="agenda" element={<SchedulePage />} />
          <Route path="cavalier/:id" element={<CavalierPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="poneys" element={<PoneysPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
