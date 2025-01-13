import React, { createContext, useState } from "react";

interface AuthContextProps {
  userId:string|null;
  userName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (userId:string, userName: string, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  userId:null,
  userName: null,
  accessToken: null,
  refreshToken: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(
      localStorage.getItem("userId")
  );  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  const login = (
    userId:string,
    userName: string,
    accessToken: string,
    refreshToken: string
  ) => {
    setUserId(userId);
    setUserName(userName);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem("userName", userName);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUserName(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("userName");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ userId,userName, accessToken, refreshToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
