import React from "react";
import Title from "./common/Title";
import { assets } from "../assets/data";

const Testimonial = () => {
  return (
    <section className="max-padd-container py-16 xl:py-32">
      <Title
        title1={"Ce que les gens disent"}
        title2={"Ne nous croyez pas sur parole"}
        titleStyles={"mb-10"}
        para={
          "Écoutez ce que les utilisateurs disent de nous. Nous cherchons toujours des moyens de nous améliorer. Si vous avez une expérience positive avec nous, laissez un avis."
        }
      />
      {/* CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-primary w-full space-y-4 p-3 rounded-md text-gray-500 text-sm">
          <div className="flexBetween">
            <div className="flex gap-1">
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
            </div>
            <p>08 Dec 2025</p>
          </div>
          <p>
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia voluptate quos sequi
            nesciunt obcaecati sapiente eos, facilis voluptatum nam quae? Quaerat repellendus sit
            explicabo? Omnis, repellat quidem. Dignissimos, possimus dolorem!"
          </p>
          <div className="flex items-center gap-2">
            <img src={assets.user1} alt="userImg" className="h-8 w-8 rounded-full" />
            <p className="text-gray-800 font-medium">John Doe</p>
          </div>
        </div>
        <div className="bg-primary w-full space-y-4 p-3 rounded-md text-gray-500 text-sm">
          <div className="flexBetween">
            <div className="flex gap-1">
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
            </div>
            <p>08 Dec 2025</p>
          </div>
          <p>
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia voluptate quos sequi
            nesciunt obcaecati sapiente eos, facilis voluptatum nam quae? Quaerat repellendus sit
            explicabo? Omnis, repellat quidem. Dignissimos, possimus dolorem!"
          </p>
          <div className="flex items-center gap-2">
            <img src={assets.user2} alt="userImg" className="h-8 w-8 rounded-full" />
            <p className="text-gray-800 font-medium">John Doe</p>
          </div>
        </div>
        <div className="bg-primary w-full space-y-4 p-3 rounded-md text-gray-500 text-sm">
          <div className="flexBetween">
            <div className="flex gap-1">
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
              <img src={assets.star} alt="" width={16} />
            </div>
            <p>08 Dec 2025</p>
          </div>
          <p>
            "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia voluptate quos sequi
            nesciunt obcaecati sapiente eos, facilis voluptatum nam quae? Quaerat repellendus sit
            explicabo? Omnis, repellat quidem. Dignissimos, possimus dolorem!"
          </p>
          <div className="flex items-center gap-2">
            <img src={assets.user3} alt="userImg" className="h-8 w-8 rounded-full" />
            <p className="text-gray-800 font-medium">John Doe</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
