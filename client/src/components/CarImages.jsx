import React, { useState, useMemo, useEffect } from "react";

const CarImages = ({ car }) => {
  const initialImage = useMemo(() => {
    if (car && car.images && car.images.length > 0) {
      return car.images[0];
    }
    return null;
  }, [car]);

  const [image, setImage] = useState(initialImage);

  // Update image when car changes
  useEffect(() => {
    if (car && car.images && car.images.length > 0) {
      setImage(car.images[0]);
    } else {
      setImage(null);
    }
  }, [car]);

  if (!car || !car.images || car.images.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-primary rounded-2xl overflow-hidden flexCenter w-full h-[244px] lg:h-[322px]">
          <div className="text-gray-400">Aucune image disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* MAIN IMAGE */}
      <div className="bg-primary rounded-2xl overflow-hidden flexCenter w-full h-[244px] lg:h-[322px]">
        {image ? (
          <img
            src={image}
            alt=""
            loading="eager"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">Aucune image disponible</div>
        )}
      </div>
      {/* THUMBAILS GRID */}
      <div className="grid grid-cols-2 gap-5">
        {car.images.map((item, index) => (
          <button
            key={index}
            onClick={() => setImage(item)}
            type="button"
            className={`bg-primary rounded-2xl overflow-hidden flexCenter w-full h-[111px] lg:h-[122px] transition-transform duration-400 ${
              item === image ? "border-8 border-solid/10 scale-[101%]" : "hover:scale-[101%]"
            }`}
          >
            <img
              src={item}
              alt={`thumb-${index}`}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarImages;
