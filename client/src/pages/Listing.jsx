import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Item from "./../components/Item";
import { useAppContext } from "../hooks/useAppContext";

const Listing = () => {
  const { cars, searchQuery, currency } = useAppContext();
  const [selectedFilters, setSelectedFilters] = useState({
    bodyType: [],
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");
  const [currPage, setCurrPage] = useState(1);
  const itemsPerPage = 6;
  const [searchParams] = useSearchParams();
  const heroDestination = (searchParams.get("destination") || "").toLowerCase().trim();

  const sortOptions = ["Pertinent", "Prix croissant", "Prix décroissant"];

  const bodyType = ["Coupe", "SUV", "Hatchback", "Sedan", "Convertible", "Van", "Grand Tourer"];

  const bodyTypeLabels = {
    Coupe: "Coupé",
    SUV: "SUV",
    Hatchback: "Berline compacte",
    Sedan: "Berline",
    Convertible: "Cabriolet",
    Van: "Monospace",
    "Grand Tourer": "Grand Tourer",
  };

  const priceRange = ["0 to 20000", "20000 to 30000", "30000 to 50000", "50000 to 99000"];

  const priceRangeLabels = {
    "0 to 20000": "0 à 20000",
    "20000 to 30000": "20000 à 30000",
    "30000 to 50000": "30000 à 50000",
    "50000 to 99000": "50000 à 99000",
  };

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      if (checked) {
        updated[type] = [...updated[type], value];
      } else {
        updated[type] = updated[type].filter(v => v !== value);
      }
      return updated;
    });
  };

  const filteredCars = useMemo(() => {
    const sortCars = (a, b) => {
      if (selectedSort === "Prix croissant") return a.price.sale - b.price.sale;
      if (selectedSort === "Prix décroissant") return b.price.sale - a.price.sale;
      return 0;
    };

    const matchesPrice = car => {
      if (selectedFilters.priceRange.length === 0) return true;
      return selectedFilters.priceRange.some(range => {
        const [minStr, maxStr] = range.split(" to ");
        const min = Number(minStr?.trim() || 0);
        const max = Number(maxStr?.trim() || Infinity);
        return car.price?.sale >= min && car.price?.sale <= max;
      });
    };

    const matchesType = car => {
      if (selectedFilters.bodyType.length === 0) return true;
      return selectedFilters.bodyType.includes(car.bodyType);
    };

    const matchesSearch = car => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (car.title || "").toLowerCase().includes(q) ||
        (car.city || "").toLowerCase().includes(q) ||
        (car.country || "").toLowerCase().includes(q)
      );
    };

    const matchesHeroDestination = car => {
      if (!heroDestination) return true;
      return (car.city || "").toLowerCase().includes(heroDestination);
    };

    return cars
      .filter(c => {
        return matchesType(c) && matchesPrice(c) && matchesSearch(c) && matchesHeroDestination(c);
      })
      .sort(sortCars);
  }, [cars, selectedFilters, selectedSort, searchQuery, heroDestination]);

  const getPaginatedCars = () => {
    const startIndex = (currPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCars.slice(startIndex, endIndex);
  };

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / itemsPerPage));
  const paginatedCars = getPaginatedCars();

  return (
    <div className="bg-primary">
      <div className="max-padd-container !px-0 mt-18 pb-16">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="min-w-72 bg-white p-4 pl-6 lg:p-12 rounded-r-xl my-4">
            <div className="py-3">
              <h5 className="mb-3">Trier par</h5>
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value)}
                className="bg-primary ring-1 ring-slate-900/10 outline-none text-gray-30 text-sm font-semibold text-gray-50 h-8 w-full rounded px-2"
              >
                {sortOptions.map((sort, index) => (
                  <option key={index} value={sort}>
                    {sort}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-5 mt-5 bg-primary rounded-xl">
              <h5 className="mb-4">Type de voiture</h5>
              {bodyType.map(type => (
                <label key={type} className={"flex gap-2 text-sm font-semibold text-gray-50 mb-1"}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.bodyType.includes(type)}
                    onChange={e => handleFilterChange(e.target.checked, type, "bodyType")}
                  />
                  {bodyTypeLabels[type]}
                </label>
              ))}
            </div>

            <div className="p-5 mt-5 bg-primary rounded-xl">
              <h5 className="mb-4">Gamme de prix</h5>
              {priceRange.map(price => (
                <label key={price} className={"flex gap-2 text-sm font-semibold text-gray-50 mb-1"}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.priceRange.includes(price)}
                    onChange={e => handleFilterChange(e.target.checked, price, "priceRange")}
                  />
                  {currency}
                  {priceRangeLabels[price]}
                </label>
              ))}
            </div>
          </div>

          <div className="max-sm:px-10 sm:pr-10 bg-white p-4 rounded-l-xl my-4 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {paginatedCars && paginatedCars.length > 0 ? (
                paginatedCars.map(car => <Item key={car._id} car={car} />)
              ) : (
                <p className="capitalize">Aucune voiture trouvée pour les filtres sélectionnés.</p>
              )}
            </div>

            <div className="flexCenter flex flex-wrap mt-14 mb-10 gap-3">
              <button
                disabled={currPage === 1}
                onClick={() => setCurrPage(prev => Math.max(1, prev - 1))}
                className={`btn-solid !py-1 !px-3 ${
                  currPage === 1 && "opacity-50 cursor-not-allowed"
                }`}
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrPage(index + 1)}
                  className={`btn-outline h-8 w-8 p-0 flexCenter ${
                    currPage === index + 1 && "btn-light"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currPage === totalPages}
                onClick={() => setCurrPage(prev => Math.min(totalPages, prev + 1))}
                className={`btn-solid !py-1 !px-3 ${
                  currPage === totalPages && "opacity-50 cursor-not-allowed"
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listing;
