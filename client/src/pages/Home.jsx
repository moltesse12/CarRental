import React from 'react'
import Hero from './../components/Hero';
import FeaturedCars from './../components/FeaturedCars';
import About from './../components/About';
import Banner from './../components/Banner';
import Testimonial from './../components/Testimonial';
// import TopPicks from './../components/TopPicks';


const Home = () => {
  return (
    <div>
      <Hero />
      <About />
      {/* <TopPicks /> */}
      <FeaturedCars />
      <Banner />
      <Testimonial />
    </div>
  )
}

export default Home
