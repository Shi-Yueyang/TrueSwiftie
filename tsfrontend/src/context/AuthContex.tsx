import React, { createContext, useState } from "react";

interface AuthContextProps {
  userId: string | null;
  userName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isStaff: boolean;
  groups: string[];
  login: (
    userId: string,
    userName: string,
    accessToken: string,
    refreshToken: string,
    isStaff: boolean,
    groups: string[]
  ) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  userId: null,
  userName: null,
  accessToken: null,
  refreshToken: null,
  isStaff: false,
  groups: [],
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [groups, setGroups] = useState<string[]>([]);

  const login = (
    userId: string,
    userName: string,
    accessToken: string,
    refreshToken: string,
    isStaff: boolean,
    groups: string[]
  ) => {
    setUserId(userId);
    setUserName(userName);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsStaff(isStaff);
    setGroups(groups);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUserName(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsStaff(false);
    setGroups([]);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ userId, userName, accessToken, refreshToken, isStaff, groups, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
