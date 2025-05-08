import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '@/shared/types/user';

export function useUserState() {
  const { data: session } = useSession();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/users/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError('Failed to load user data');
        }
      } catch (err: unknown) {
        console.error('Error fetching user data:', err);
        setError('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  return {
    user,
    loading,
    error,
    // Helper properties
    isLoggedIn: !!session?.user,
    userId: session?.user?.id,
    userName: user?.name || session?.user?.name,
    userEmail: user?.email || session?.user?.email,
    userRole: user?.role || session?.user?.role,
    // Streak information
    loginStreak: user?.loginStreak || 0,
    hasLoginStreak: (user?.loginStreak || 0) > 0,
  };
} 