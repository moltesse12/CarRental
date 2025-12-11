import React from "react";
import Title from "./common/Title";
import { assets } from "../assets/data";

const About = () => {
  return (
    <section className="max-padd-container py-16 xl:py-22 !pt-36">
      {/* CONTAINER */}
      <div className="flex items-center flex-col lg:flex-row gap-12">
        {/* INFO LEFT SIDE */}
        <div className="flex-[5]">
          <Title
            title1={"YOUR Trusted Real Easte Partner"}
            title2={"Helping Your Every Step of The Way"}
            paraStyles={"hidden"}
          />{" "}
          <p className="mb-10 mt-5">
            Find reliable car with transparent pricing,verified inspections,flexible pichup and
            delivery option,and 24/7 customer support for a smooth rental or buying experience.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-primary">
              <h5>Wide Vehicule Selection</h5>
              <p className="text-sm mt-2">
                Book in seconds width instant confirmations and flexible pickUp options,so you get
                on the road fast without waiting or hassles.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primaryOne">
              <h5>Quick Service</h5>
              <p className="text-sm mt-2">
                {" "}
                Choose from economy to luxry models,regularly maintained and verified, giving you
                reliable Performance and the perfect car for every trip. Upfront rates with no
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primaryTwo">
              <h5>Transparent Pricing</h5>
              <p className="text-sm mt-2">
                hidden fees, clear breakdowns stays predictable and easy to understand before
                bookings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary">
              <h5>24/7 Support</h5>
              <p className="text-sm mt-2">
                Around the clock customer support via chat and phone, resolving issues quickly and
                helping with changes,extensions,or roadside assistance anytime you needs
              </p>
            </div>
          </div>
        </div>
        {/* INFO RIGHT SIDE */}
        <div className="flex-[4] flex gap-7">
          <div className="relative flex justify-end mb-8">
            <img src={assets.about1} alt="" className="rounded-2xl" />
          </div>
          <div className="relative flex justify-end mb-8">
            <img src={assets.about2} alt="" className="rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
