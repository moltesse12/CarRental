import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";

const ListCar = () => {
  const { axios, getToken, user, currency } = useAppContext();
  const [cars, setCars] = useState([]);

  const getCars = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/cars/owner", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, getToken]);

  // TOGGLE AVAILABLE OF THE CAR
  const toggleAvailability = async carId => {
    try {
      const { data } = await axios.post(
        "/api/cars/toggle-availability",
        { carId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        getCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      getCars();
    }
  }, [user, getCars]);
  return (
    <div className="md:px-8 py-6 m-1 sm:m-3 h-[97vh] overflow-y-scroll lg:w-11/12 shadow rounded-xl">
      {/* ALL CARS */}
      <div className="mt-4">
        <div className="flex justify-between flex-wrap gap-2 sm:grid grid-cols-[2fr_2fr_1fr_1fr] lg:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] px-6 py-3 bg-solid text-white border-b border-slate-900/10 rounded-t-xl">
          <h5 className="hidden lg:block">Index</h5>
          <h5>Nom</h5>
          <h5>Adresse</h5>
          <h5>Prix</h5>
          <h5>Disponible</h5>
        </div>
      </div>
      {cars.map((car, index) => (
        <div
          key={index}
          className="flex justify-between items-center flex-wrap gap-2 sm:grid grid-cols-[2fr_2fr_1fr_1fr] lg:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] px-6 py-3 bg-primary text-gray-50 text-sm font-semibold border-b border-slate-900/10"
        >
          <div className="hidden lg:block">{index + 1}</div>
          <div className="flexStart gap-x-2 max-w-64">
            <div className="overflow-hidden rounded-lg">
              {car.images && car.images.length > 0 ? (
                <img src={car.images[0]} alt={car.title || "Voiture"} className="w-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flexCenter text-xs text-gray-400">N/A</div>
              )}
            </div>
            <div className="line-clamp-2">{car.title || "Voiture"}</div>
          </div>
          <div>{car.address || "N/A"}</div>
          <div>
            {currency}
            {car.price?.sale || 0}
          </div>
          <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
            <input
              onChange={() => toggleAvailability(car._id)}
              type="checkbox"
              className="sr-only peer"
              defaultChecked={car.isAvailable}
            />
            <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-solid transition-colors duration-200" />
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4" />
          </label>
        </div>
      ))}
    </div>
  );
};

export default ListCar;
