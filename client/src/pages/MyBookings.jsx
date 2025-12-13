import React, { useEffect, useState, useCallback } from "react";
import { assets } from "../assets/data";
import Title from "./../components/common/Title";
import { useAppContext } from "../hooks/useAppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { currency, user, axios, getToken } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const getUserBooking = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, getToken]);

  useEffect(() => {
    if (user) {
      getUserBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="bg-primary py-16 pt-28">
      <div className="max-padd-container">
        <Title title2={"Mes réservations"} title2Styles={"text-4xl"} titleStyles={"mb-10"} />

        {bookings?.map(booking => (
          <div key={booking._id} className="bg-white ring-1 ring-slate-900/5 p-4 mt-3 rounded-lg">
            {/* CAR LIST */}
            <div className="flex gap-3 mb-3">
              <div className="bg-primary rounded-xl overflow-hidden flexCenter h-19">
                {booking.car?.images && booking.car.images.length > 0 ? (
                  <img
                    src={booking.car.images[0]}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flexCenter h-full w-full text-gray-400 text-xs">Aucune image</div>
                )}
              </div>

              <div>
                <h5 className="capitalize line-clamp-1">{booking.car?.title || "Voiture"}</h5>

                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-x-2">
                    <h5>Places :</h5>
                    <p>{booking.car?.specs?.seats || "N/A"}</p>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <h5>Total :</h5>
                    <p>
                      {currency}
                      {booking.totalPrice || 0}
                    </p>
                  </div>

                  {booking.car?.address && (
                    <div>
                      <p className="flex items-baseline gap-1 mt-0.5">
                        <img src={assets.pin} alt="" width={13} />
                        {booking.car.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* Booking Summary */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-t border-gray-300 pt-3 mt-2">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-x-2">
                      <h5>ID de réservation :</h5>
                      <p className="text-gray-400 text-xs">{booking._id}</p>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <h5>Retrait :</h5>
                      <p className="text-gray-400 text-xs">
                        {new Date(booking.pickUpDate).toDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <h5>Restitution :</h5>
                      <p className="text-gray-400 text-xs">
                        {new Date(booking.dropOffDate).toDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-x-2">
                      <h5>Paiement :</h5>
                      <div className="flex items-center gap-1">
                        <span
                          className={`min-w-2.5 h-2.5 rounded-full ${
                            booking.isPaid ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        <p>{booking.isPaid ? "Payé" : "Non payé"}</p>
                      </div>
                    </div>

                    {!booking.isPaid && (
                      <button
                        // onClick={()=> handlePayment(booking._id)}
                        className="btn-solid !py-1 !text-xs rounded-sm"
                      >
                        Payer maintenant
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
