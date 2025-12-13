import React, { useEffect, useState, useCallback } from "react";
import { assets } from "../../assets/data";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { axios, getToken, user, currency } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const getDashboardData = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/bookings/agency", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setDashboardData(data.dashboard || {
          bookings: [],
          totalBookings: 0,
          totalRevenue: 0,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [axios, getToken]);

  useEffect(() => {
    if (user) {
      getDashboardData();
    }
  }, [user, getDashboardData]);

  return (
    <div className="md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll lg:w-11/12 bg-white rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flexStart gap-7 p-5 bg-primaryOne lg:min-w-56 rounded-xl">
          <img src={assets.carBlack} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4>{dashboardData?.totalBookings?.toString().padStart(2, 0)}</h4>
            <h5 className="text-solid">Ventes totales</h5>
          </div>
        </div>
        <div className="flexStart gap-7 p-5 bg-primaryTwo lg:min-w-56 rounded-xl">
          <img src={assets.carBlack} alt="" className="hidden sm:flex w-8" />
          <div>
            <h4>{dashboardData?.totalRevenue || 0}</h4>
            <h5 className="text-solid">Gain total</h5>
          </div>
        </div>
      </div>
      {/* latest Booking / Sales */}
      <div className="mt-4">
        <div className="flex justify-between flex-wrap gap-2 sm:grid grid-cols-[2fr_2fr_1fr_1fr] lg:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] px-6 py-3 bg-solid text-white border-b border-slate-900/10 rounded-t-xl">
          <h5 className="hidden lg:block">Index</h5>
          <h5>Voiture</h5>
          <h5>Dates de réservation</h5>
          <h5>Montant</h5>
          <h5>Statut</h5>
        </div>
      </div>
      {dashboardData.bookings.map((booking, index) => (
        <div
          key={index}
          className="flex justify-between items-center flex-wrap gap-2 sm:grid grid-cols-[2fr_2fr_1fr_1fr] lg:grid-cols-[0.5fr_2fr_2fr_1fr_1fr] px-6 py-3 bg-primary text-gray-50 text-sm font-semibold border-b border-slate-900/10"
        >
          <div className="hidden lg:block">{index + 1}</div>
          <div className="flexStart gap-x-2 max-w-64">
            <div className="overflow-hidden rounded-lg">
              {booking.car?.images && booking.car.images.length > 0 ? (
                <img
                  src={booking.car.images[0]}
                  alt={booking.car?.title || "Voiture"}
                  className="w-16 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flexCenter text-xs text-gray-400">N/A</div>
              )}
            </div>
            <div className="line-clamp-2">{booking.car?.title || "Voiture"}</div>
          </div>
          <div>
            {new Date(booking.pickUpDate).toLocaleDateString()} à{" "}
            {new Date(booking.dropOffDate).toLocaleDateString()}
          </div>
          <div>
            {currency}
            {booking.totalPrice}
          </div>
          <button
            className={`${
              booking.isPaid ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
            } w-22 py-0.5 rounded-full text-xs border border-green-500/30 `}
          >
            {booking.isPaid ? "Payé" : "Non payé"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
