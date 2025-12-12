import React from "react";
import Title from "./common/Title";
import { assets } from "../assets/data";

const About = () => {
  return (
    <section className="max-padd-container py-16 xl:py-22 pt-36!">
      {/* CONTAINER */}
      <div className="flex items-center flex-col lg:flex-row gap-12">
        {/* INFO LEFT SIDE */}
        <div className="flex-5">
          <Title
            title1={"VOTRE Partenaire de Confiance"}
            title2={"Vous aider à chaque étape"}
            paraStyles={"hidden"}
          />{" "}
          <p className="mb-10 mt-5">
            Trouvez une voiture fiable avec une tarification transparente, des inspections
            vérifiées, des options de retrait et de livraison flexibles, et un support client 24/7
            pour une expérience de location ou d'achat fluide.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-primary">
              <h5>Large sélection de véhicules</h5>
              <p className="text-sm mt-2">
                Réservez en quelques secondes avec des confirmations instantanées et des options de
                retrait flexibles, pour vous mettre en route rapidement sans attendre.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primaryOne">
              <h5>Service rapide</h5>
              <p className="text-sm mt-2">
                {" "}
                Choisissez parmi les modèles économiques aux modèles de luxe, régulièrement
                entretenus et vérifiés, vous offrant une performance fiable et la voiture parfaite
                pour chaque voyage. Tarifs explicites sans
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primaryTwo">
              <h5>Tarification transparente</h5>
              <p className="text-sm mt-2">
                frais cachés, les ventilations claires restent prévisibles et faciles à comprendre
                avant les réservations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary">
              <h5>Support 24h/24</h5>
              <p className="text-sm mt-2">
                Le support client disponible à tout moment via le chat et le téléphone, résolvant
                les problèmes rapidement et vous aidant avec les modifications, extensions ou
                l'assistance routière à tout moment
              </p>
            </div>
          </div>
        </div>
        {/* INFO RIGHT SIDE */}
        <div className="flex-4 flex gap-7">
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
