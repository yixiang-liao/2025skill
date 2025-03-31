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
      <Route path="/Popularity/home" element={<HomePage />} />
      <Route path="/Popularity/CasePage/:id" element={<CasePage />} />
      <Route path="/Popularity/Tickets" element={<Tickets />} />
      <Route path="/Popularity/RankTable" element={<RankTable />} />
      <Route
        path="/back"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <Back />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ScoreBack"
        element={
          <ProtectedRoute allowedRoles={['reviewer']}>
            <ScoreBack />
          </ProtectedRoute>
        }
      />
      <Route path="/loginpage" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
