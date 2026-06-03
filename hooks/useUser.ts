'use client';
import { useState, useEffect } from 'react';

const USER_KEY = 'livrr_user';

interface LivrrUser {
  id: string;
  name: string;
}

function generateUserId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useUser() {
  const [user, setUser] = useState<LivrrUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  function createUser(name: string): LivrrUser {
    const newUser: LivrrUser = { id: generateUserId(), name };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }

  return { user, loading, createUser };
}
