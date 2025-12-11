import React, { useEffect, useState } from "react";
import Title from "./common/Title";
import Item from "./Item.jsx";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
// import required modules
import { Autoplay } from "swiper/modules";
import { useAppContext } from "../context/AppContext";

const TopPicks = () => {
  const { cars, searchedCities, setSearchedCities } = useAppContext();
  const [topPicks, setTopPicks] = useState([]);

  useEffect(() => {
    const data = cars.filter(car => searchedCities.includes(car.city));
    setTopPicks(data);
  }, [cars, setSearchedCities]);

  return (
    topPicks.length > 0 && (
      <section className="max-padd-container py-16 xl:py-22">
        <Title title1={"Top Picks for you"} title2={"Popular in your area"} titleStyles={"mb-10"} />
        {/* CONTAINER */}
        <Swiper
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            600: {
              slidesPerView: 2,
              spaceBetween: 30,
            },
            1124: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1300: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          modules={[Autoplay]}
          className="h-[488px] md:h-[533px] xl:h-[422px] mt-5"
        >
          {topPicks.slice(0, 6).map(car => (
            <SwiperSlide key={car._id}>
              <Item car={car} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    )
  );
};

export default TopPicks;
