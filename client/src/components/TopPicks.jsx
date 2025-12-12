// import React, { useContext} from "react";
// import Title from "./common/Title";
// import Item from "./Item.jsx";
// import { Swiper, SwiperSlide } from "swiper/react";
// // import { CarsContext } from "../context/CarsContext";

// // Import Swiper styles
// import "swiper/css";
// // import required modules
// import { Autoplay } from "swiper/modules";

// export default function TopPicks() {
//   // const { cars, searchedCities } = useContext(CarsContext);

//   const topPicks =
//     searchedCities.length === 0
//       ? cars.filter(car => car.featured).slice(0, 6)
//       : cars.filter(car => searchedCities.includes(car.city)).slice(0, 6);

//   return (
//     topPicks.length > 0 && (
//       <section className="max-padd-container py-16 xl:py-22">
//         <Title
//           title1={"Nos meilleurs choix pour vous"}
//           title2={"Populaire dans votre région"}
//           titleStyles={"mb-10"}
//         />
//         {/* CONTAINER */}
//         <Swiper
//           autoplay={{
//             delay: 3500,
//             disableOnInteraction: false,
//           }}
//           breakpoints={{
//             600: {
//               slidesPerView: 2,
//               spaceBetween: 30,
//             },
//             1124: {
//               slidesPerView: 3,
//               spaceBetween: 30,
//             },
//             1300: {
//               slidesPerView: 4,
//               spaceBetween: 30,
//             },
//           }}
//           modules={[Autoplay]}
//           className="h-[488px] md:h-[533px] xl:h-[422px] mt-5"
//         >
//           {topPicks.map(car => (
//             <SwiperSlide key={car._id}>
//               <Item car={car} />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </section>
//     )
//   );
// }
