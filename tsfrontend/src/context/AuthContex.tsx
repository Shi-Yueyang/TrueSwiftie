import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export interface User {
  id: number;
  username: string;
  temporary_name: string;
  is_staff: boolean;
  groups: string[];
  avatar: string;
}

interface AuthContextProps {
  userId: string | null;
  userName: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isStaff: boolean;
  groups: string[];
  avatar: string | null;
  isLoading: boolean;
  login: (
    userId: string,
    userName: string,
    accessToken: string,
    refreshToken: string,
    isStaff: boolean,
    groups: string[],
    avatar: string
  ) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  userId: null,
  userName: null,
  email: null,
  accessToken: null,
  refreshToken: null,
  isStaff: false,
  groups: [],
  avatar: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const login = (
    userId: string,
    userName: string,
    accessToken: string,
    refreshToken: string,
    isStaff: boolean,
    groups: string[],
    avatar: string
  ) => {
    setUserId(userId);
    setUserName(userName);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsStaff(isStaff);
    setGroups(groups);
    setAvatar(avatar);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };
  const logout = () => {
    setUserId(null);
    setUserName(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsStaff(false);
    setGroups([]);
    setAvatar(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_IP}/core/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.groups.includes("formal")) {
        setUserName(response.data.username);
      } else {
        setUserName(response.data.temporary_name);
      }
      setEmail(response.data.email ?? null);
      setUserId(response.data.id);
      setIsStaff(response.data.is_staff);
      setGroups(response.data.groups);
      setAvatar(response.data.avatar);
    } catch (err) {
      console.error("Error fetching user data:", err);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchUserData()
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        userName,
  email,
        accessToken,
        refreshToken,
        isStaff,
        groups,
        avatar,
        isLoading,
        login,
        logout,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
