import React from "react";
import { assets } from "../assets/data";
import { useNavigate } from "react-router-dom";

const Item = ({ car }) => {
  const currency = "$";
  const navigate = useNavigate();

  // colors to cycle through
  const colors = ["#5f5f5", "#f0f9fd", "#fcf6ed"];

  // compute an index from product._id parseInt fallbaack to 0 for safe
  const bgColor = colors[parseInt(car._id?.slice(-4) || "0", 16) % colors.length];

  return (
    <div
      onClick={() => {
        navigate("/Listing/" + car._id);
        scrollTo(0, 0);
      }}
      className="block rounded-lg ring-1 ring-slate-900/5 p-5 cursor-pointer"
      style={{ backgroundColor: bgColor }}
    >
      <h4 className="line-clamp-1">{car.title}</h4>
      <div className="flexBetween">
        <h5 className="my-1 text-gray-50">{car.bodyType}</h5>
        <div className="text-sm font-bold text-solid">
          {currency}
          {car.price?.sale || 0} | {currency}
          {car.price?.rent || 0}.00 <span className="text-xs">/jour</span>
        </div>
      </div>
      {/* IMAGE */}
      <div className="relative py-6">
        {car.images && car.images.length > 0 ? (
          <img src={car.images[0]} alt={car.title} />
        ) : (
          <div className="flexCenter h-32 bg-gray-200 rounded">Aucune image</div>
        )}
      </div>
      {/* Info */}
      <div>
        <div className="flexBetween py-2">
          <p className="flexCenter flex-col gap-1 font-semibold">
            <img src={assets.transmission} alt="" width={19} />
            {car.specs?.transmission || "N/A"}
          </p>
          <hr className="h-11 w-0.5 bg-slate-900/20 border-none" />
          <p className="flexCenter flex-col gap-1 font-semibold">
            <img src={assets.seats} alt="" width={23} />
            {car.specs?.seats || "N/A"}
          </p>
          <hr className="h-11 w-0.5 bg-slate-900/20 border-none" />
          <p className="flexCenter flex-col gap-1 font-semibold">
            <img src={assets.fuelType} alt="" width={19} />
            {car.specs?.fuelType || "N/A"}
          </p>
          <hr className="h-11 w-0.5 bg-slate-900/20 border-none" />
          <p className="flexCenter flex-col gap-1 font-semibold">
            <img src={assets.odometer} alt="" width={19} />
            {car.odometer}
          </p>
        </div>
        <p className="pt-2 mb-4 line-clamp-2">{car.description}</p>
      </div>
    </div>
  );
};

export default Item;
