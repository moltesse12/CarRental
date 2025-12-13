import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/data";
import CarImages from "../components/CarImages";
import { useAppContext } from "../hooks/useAppContext";
import toast from "react-hot-toast";

const CarDetails = () => {
  const { id } = useParams();
  const { cars, axios, getToken, currency } = useAppContext();
  const navigate = useNavigate();

  const car = useMemo(() => {
    if (cars && cars.length > 0) {
      return cars.find(c => c._id === id) || null;
    }
    return null;
  }, [cars, id]);
  const [pickUpDate, setPickUpDate] = useState(null);
  const [dropOffDate, setDropOffDate] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // CHECK AVAILABILITY
  const checkAvailability = async () => {
    try {
      // check is pickUpDate is greater than dropOffDate
      if (pickUpDate > dropOffDate) {
        toast.error("La date de retrait ne peut pas être supérieure à la date de restitution");
        return;
      }
      if (!pickUpDate || !dropOffDate) {
        toast.error("Veuillez sélectionner les dates de retrait et de restitution");
        return;
      }
      const { data } = await axios.post("/api/bookings/check-availability", {
        car: id,
        pickUpDate,
        dropOffDate,
      });
      if (data.success) {
        setIsAvailable(data.isAvailable);
        if (data.isAvailable) {
          toast.success("La voiture est disponible pour les dates sélectionnées");
        } else {
          toast.error("La voiture n'est pas disponible pour les dates sélectionnées");
        }
      } else {
        toast.error("Impossible de vérifier la disponibilité");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // BOOK CAR IF ISAVAILABLE
  const onSubmitHandler = async e => {
    e.preventDefault();
    try {
      if (!isAvailable) {
        checkAvailability();
        return;
      } else {
        const { data } = await axios.post(
          "/api/bookings/book",
          { car: id, pickUpDate, dropOffDate },
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        );
        if (data.success) {
          toast.success(data.message);
          navigate("/my-bookings");
          scrollTo(0, 0);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // `car` is derived from `cars` and `id` using `useMemo` above.
  return (
    car && (
      <div className="bg-primary">
        <div className="max-padd-container px-6 pt-2 pb-16">
          {/* CONTAINER */}
          <div className="flex flex-col md:flex-row gap-6 mt-16">
            {/* INFO LEFT SIDE */}
            <div className="flex-[5] bg-white p-5 rounded-xl my-4">
              <p className="flexStart gap-x-2">
                <img src={assets.pin} alt="" width={19} />
                <span>{car.address}</span>
              </p>
              <div className="flex justify-between flex-col sm:flex-row sm:items-end mt-3">
                <h3>{car.title}</h3>
                <h4>
                  {currency}
                  {car.price?.sale || 0} | {car.price?.rent || 0}.00/jour
                </h4>
              </div>
              <div className="flex justify-between items-start my-1">
                <h4 className="text-solid">{car.bodyType}</h4>
                <div className="flex items-baseline gap-2 relative top-1.5">
                  <h4 className="relative bottom-0.5 text-black">5.0</h4>
                  <img src={assets.star} alt="startIcon" width={18} />
                  <img src={assets.star} alt="startIcon" width={18} />
                  <img src={assets.star} alt="startIcon" width={18} />
                  <img src={assets.star} alt="startIcon" width={18} />
                  <img src={assets.star} alt="startIcon" width={18} />
                </div>
              </div>
              <div className="flex gap-x-4 mt-3">
                <p className="flexCenter gap-x-2 border-r border-slate-900/50 pr-4 font-medium">
                  <img src={assets.transmission} alt="" width={18} />
                  {car.specs?.transmission || "N/A"}
                </p>
                <p className="flexCenter gap-x-2 border-r border-slate-900/50 pr-4 font-medium">
                  <img src={assets.seats} alt="" width={18} />
                  {car.specs?.seats || "N/A"}
                </p>
                <p className="flexCenter gap-x-2 border-r border-slate-900/50 pr-4 font-medium">
                  <img src={assets.fuelType} alt="" width={18} />
                  {car.specs?.fuelType || "N/A"}
                </p>
                <p className="flexCenter gap-x-2 border-r border-slate-900/50 pr-4 font-medium">
                  <img src={assets.odometer} alt="" width={18} />
                  {car.odometer}
                </p>
              </div>
              <div className="mt-5">
                <h4 className="mt-4 mb-1">Détails de la voiture</h4>
                <p className="mt-4">{car.description}</p>
              </div>
              <h4 className="mt-6 mb-2">Caractéristiques</h4>
              <div className="flex gap-3 flex-wrap">
                {car.features && car.features.length > 0 ? (
                  car.features.map((feature, index) => (
                    <p key={index} className="p-3 py-1 rounded-lg bg-primary">
                      {typeof feature === 'string' ? feature : feature.name || feature}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-400">Aucune caractéristique disponible</p>
                )}
              </div>
              {/* FORM */}
              <form
                onSubmit={onSubmitHandler}
                className="text-gray-500 bg-primary rounded-lg px-6 py-4 flex flex-col lg:flex-row gap-4 max-w-md lg:max-w-full ring-1 ring-slate-900/5 relative mt-10"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <img src={assets.calendar} alt="calendarIcon" width={20} />
                    <label htmlFor="pickUpDate">Date de retrait</label>
                  </div>
                  <input
                    type="date"
                    onChange={e => setPickUpDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    id="pickUpDate"
                    className="rounded bg-white border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <img src={assets.calendar} alt="calendarIcon" width={20} />
                    <label htmlFor="dropOffDate">Date de restitution</label>
                  </div>
                  <input
                    type="date"
                    onChange={e => setDropOffDate(e.target.value)}
                    min={pickUpDate || new Date().toISOString().split("T")[0]}
                    id="dropOffDate"
                    disabled={!pickUpDate}
                    className="rounded bg-white border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
                  />
                </div>
                <button type="submit" className="flexCenter gap-1 rounded-md btn-solid min-w-44">
                  <img src={assets.search} alt="searcIcon" width={20} className="invert" />
                  <span>{isAvailable ? "Réserver la voiture" : "Vérifier les dates"}</span>
                </button>
              </form>
              {/* CONTACT Agency */}
              {car.agency && (
                <div className="p-6 bg-primary rounded-xl mt-10 max-w-sm">
                  <h4 className="mb-3">Pour l'achat, contactez</h4>
                  <div className="text-sm sm:w-80 divide-y divide-gray-500/30 ring-1 ring-slate-900/10 rounded">
                    <div className="flex items-start justify-between p-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5>{car.agency.name || "Agence"}</h5>
                          <p className="bg-green-500/20 px-2 py-0.5 rounded-full text-xs text-green-600 border border-green-500/30 ">
                            Agence
                          </p>
                        </div>
                        <p>Bureau d'agence</p>
                      </div>
                      {car.agency.owner?.image && (
                        <img src={car.agency.owner.image} alt="" className="h-10 w-10 rounded-full" />
                      )}
                    </div>
                    {car.agency.contact && (
                      <div className="flexStart gap-2 p-1.5">
                        <div className="bg-green-500/20 p-1 rounded-full border border-green-500/30">
                          <img src={assets.phone} alt="" width={14} />
                        </div>
                        <p>{car.agency.contact}</p>
                      </div>
                    )}
                    {(car.agency.email || car.agency.mail) && (
                      <div className="flexStart gap-2 p-1.5">
                        <div className="bg-green-500/20 p-1 rounded-full border border-green-500/30">
                          <img src={assets.mail} alt="" width={14} />
                        </div>
                        <p>{car.agency.email || car.agency.mail}</p>
                      </div>
                    )}
                  <div className="flex items-center divide-x divide-gray-500/30">
                    <button className="flex items-center justify-center gap-2 w-1/2 py-3 cursor-pointer">
                      <img src={assets.mail} alt="" width={19} />
                      Envoyer un email
                    </button>
                    <button>
                      <img src={assets.phone} alt="" width={19} /> Appeler maintenant
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>
            {/* IMAGE RIGHT SIDE */}
            <div className="flex flex-[4] w-full bg-white p-4 rounded-xl my-4">
              <CarImages car={car} />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CarDetails;
