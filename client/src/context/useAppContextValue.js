import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const useAppContextValue = () => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);
  const [showAgencyReg, setShowAgencyReg] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const { getToken } = useAuth();

  const getUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setIsOwner(data.role === "agencyOwner");
        setSearchedCities(data.recentSearchedCities || []);
      } else {
        console.error("Failed to fetch user:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [getToken]);

  const getCars = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/cars");
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error("Failed to fetch cars");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user, getUser]);

  useEffect(() => {
    getCars();
  }, [getCars]);

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

  return value;
};
