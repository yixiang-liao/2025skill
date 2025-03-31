import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/loginpage');
  };

  return <button onClick={handleLogout}>登出</button>;
}