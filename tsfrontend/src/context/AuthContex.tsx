import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export interface User{
  id: number;
  username: string;
  temporary_name: string;
  is_staff: boolean;
  groups: string[];
}

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

  const fetchUserData = async ()=>{
    try{
      const token = localStorage.getItem("accessToken");
      if(!token){
        return;
      }
      console.log('kkkk',token);
      const responseMe = await axios.get(
        `${import.meta.env.VITE_BACKEND_IP}/core/users/me/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserId(responseMe.data.id);
      setUserName(responseMe.data.username);
      setIsStaff(responseMe.data.is_staff);
      setIsStaff(responseMe.data.groups);
      
    }catch(err){
      console.error('Error fetching user data:', err);
      logout();
    }
  }

  useEffect(()=>{
    fetchUserData();
  },[]);

  return (
    <AuthContext.Provider
      value={{ userId, userName, accessToken, refreshToken, isStaff, groups, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
