import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);
  const [showAgencyReg, setShowAgencyReg] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const { getToken } = useAuth();

  const getUser = async () => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setIsOwner(data.role === "agencyOwner");
        setSearchedCities(data.searchedCities);
      } else {
        // Retry fetch user details after 6s
        setTimeout(() => {
          getUser();
        }, 6000);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const getCars= async () => {
    try {
      const { data } = await axios.get("/api/cars");
      if (data.success) {
        setCars(data.cars);
      }else{
        toast.error("Failed to fetch cars");
      }
    }catch(error){
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  useEffect(()=>{
    getCars();
  },[])

  const value = {
    axios,
    user,
    getToken,
    navigate,
    cars,
    setCars,
    currency,
    searchedCities,
    setSearchedCities,
    showAgencyReg,
    setShowAgencyReg,
    isOwner,
    setIsOwner,
    searchQuery,
    setSearchQuery,
    toast,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
