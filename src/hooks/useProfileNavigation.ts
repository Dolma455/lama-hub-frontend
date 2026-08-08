import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const useProfileNavigation = () => {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.userId);

  return (userId?: string | null) => {
    if (!userId) return;
    if (userId === currentUserId) {
      navigate('/profile');
    } else {
      navigate(`/creator/${userId}`);
    }
  };
};
