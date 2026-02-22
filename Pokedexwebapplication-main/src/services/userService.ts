export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

const USE_LIVE_API = import.meta.env.VITE_USE_LIVE_API === 'true';

export const userService = {
  async getCurrentUser(): Promise<UserProfile> {
    if (!USE_LIVE_API) {
      return {
        id: '1',
        email: 'trainer@pokedex.com',
        displayName: localStorage.getItem('userDisplayName') || 'Ash Ketchum'
      };
    }

    try {
      const res = await fetch('/api/users/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return await res.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (!USE_LIVE_API) {
      if (profile.displayName) {
        localStorage.setItem('userDisplayName', profile.displayName);
      }
      return {
        id: '1',
        email: 'trainer@pokedex.com',
        displayName: profile.displayName || 'Ash Ketchum'
      };
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      return await res.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
