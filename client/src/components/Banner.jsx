import React from "react";
import { assets } from "../assets/data";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <section className="max-padd-container py-10 pt-20">
      <div className="max-padd-container bg-solid rounded-3xl xl:max-h-72">
        {/* CONTAINER */}
        <div className="flex flex-col md:flex-row">
          {/* LEFT SIDE */}
          <div className="flex-5 relative lg:bottom-12 xl:bottom-20">
            <img src={assets.banner} alt="bannerImg" />
          </div>
          {/* RIGHT SIDE */}
          <div className="flex-4 text-white">
            <div className="flex flex-col gap-4 p-4">
              <h3 className="capitalize xl:pt-6">Achetez en confiance, louez sans souci</h3>
              <p className="text-white/70">
                Trouvez votre prochaine voiture ou gagnez avec vos véhicules en quelques minutes.
                Nous gérons les assurances, la vérification des conducteurs et les paiements
                sécurisés
              </p>
              <button onClick={() => navigate("/Listing")} className="btn-white w-36">
                Explorer les voitures
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
