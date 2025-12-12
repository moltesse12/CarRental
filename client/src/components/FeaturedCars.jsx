import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assets, cities } from "../assets/data";
import Title from "./common/Title";
import Item from "./Item.jsx";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
// import required modules
import { Autoplay } from "swiper/modules";
import { useAppContext } from "../hooks/useAppContext";

const FeaturedCars = () => {
  const { cars } = useAppContext();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const data = cars.filter(car => cities.includes(car.city));
    setFeatured(data);
  }, [cars]);
  return (
    <section className="max-padd-container py-16 xl:py-22">
      <Title
        title1={"Votre prochaine voiture vous attend"}
        title2={"Commencez à conduire avec facilité"}
        titleStyles={"mb-10"}
      />
      <div className="flexBetween mt-8 mb-6">
        <h5>
          <span className="font-bold">Affichage 1-6</span> sur 3k annonces
        </h5>
        <Link
          to={"/Listing"}
          onClick={() => scrollTo(0, 0)}
          className="bg-solid text-white text-2xl rounded-md p-2 flexCenter"
        >
          <img src={assets.sliders} alt="" className="invert" />
        </Link>
      </div>
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
        {featured.slice(0, 6).map(car => (
          <SwiperSlide key={car._id}>
            <Item car={car} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default FeaturedCars;
