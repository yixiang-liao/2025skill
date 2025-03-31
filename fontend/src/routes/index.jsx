// routes/index.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/Popularity/HomePage';
import CasePage from '../pages/Popularity/CasePage';
import Back from '../pages/back/Back';
import Tickets from '../pages/Popularity/Tickets';
import RankTable from '../pages/Popularity/RankTable';
import LoginPage from '../pages/SSO/LoginPage';
import ProtectedRoute from '../components/SSO/ProtectedRoute';
import ScoreBack from '../pages/Score/ScoreBack';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/2025skill/Popularity/home" element={<HomePage />} />
      <Route path="/2025skill/Popularity/CasePage/:id" element={<CasePage />} />
      <Route path="/2025skill/Popularity/Tickets" element={<Tickets />} />
      <Route path="/2025skill/Popularity/RankTable" element={<RankTable />} />
      <Route
        path="/2025skill/back"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <Back />
          </ProtectedRoute>
        }
      />
      <Route
        path="/2025skill/ScoreBack"
        element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ScoreBack />
          </ProtectedRoute>
        }
      />
      <Route path="/2025skill/loginpage" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
