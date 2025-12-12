import React, { useState } from "react";
import { assets } from "../assets/data";
import { useAppContext } from "../hooks/useAppContext";

const Hero = () => {
  const { navigate, searchedCities, setSearchedCities, axios, getToken } = useAppContext("");
  const [destination, setDestination] = useState("");

  const OnSearch = async e => {
    e.preventDefault();
    navigate(`/listing?destination=${destination}`);
    // API to save recent searched city
    await axios.post(
      "/api/users/store-recent-search",
      { recentSearchCities: destination },
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );
    // Add destination to searchedCities max 3 recent searched cities
    setSearchedCities(prevSearchedCities => {
      const updatedSearchedCities = [destination, ...prevSearchedCities];
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift();
      }
      return updatedSearchedCities;
    });
  };
  return (
    <section className="bg-primary">
      {/* CONTAINER */}
      <div className="max-padd-container relative flex justify-end mx-auto flex-col gap-9 py-6 pt-32 z-10">
        {/* Content */}
        <div className="flexCenter flex-col gap-y-6">
          <div className="text-center max-w-5xl">
            <h1 className="capitalize leading-tight">
              Explorez{" "}
              <span className="bg-linear-to-r from-solid to-white pl-1 rounded-md">
                des véhicules premium
              </span>{" "}
              disponibles dans des destinations intéressantes.
            </h1>
          </div>
          {/* Search/Booking Form */}

          <form
            onSubmit={OnSearch}
            className="bg-white text-gray-500 rounded-md md:rounded-full px-6 md:pl-12 py-4 flex flex-col md:flex-row gap-4 lg:gap-x-8 max-w-md md:max-w-4xl ring-1 ring-slate-900/5 relative"
          >
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <img src={assets.pin} alt="pinIcon" width={20} />
                <label htmlFor="destinationInput">Destination</label>
              </div>
              <input
                onChange={e => setDestination(e.target.value)}
                value={destination}
                list="destinations"
                id="destinationInput"
                type="text"
                className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none capitalize"
                placeholder="Taper ici"
                required
              />
              <datalist id="destinations">
                {searchedCities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <img src={assets.calendar} alt="calendarIcon" width={20} />
                <label htmlFor="pickUp">Retrait</label>
              </div>
              <input
                id="pickUp"
                type="date"
                className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
              />
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2">
                <img src={assets.calendar} alt="calendarIcon" width={20} />
                <label htmlFor="dropOff">Restitution</label>
              </div>
              <input
                id="dropOff"
                type="date"
                className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              className="flexCenter gap-1 rounded-md bg-solid text-white py-2 md:py-5 px-8 my-auto max-md:w-full max-md:py-1 cursor-pointer"
            >
              <img src={assets.search} alt="searchIcon" width={20} className="invert" />
              <span>Rechercher</span>
            </button>
          </form>
        </div>
        <div className="flexCenter">
          <img src={assets.bg} alt="bgImg" className="w-full max-w-[77%]" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
