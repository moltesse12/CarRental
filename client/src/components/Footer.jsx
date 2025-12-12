import React from "react";
import { assets } from "../assets/data";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="pt-16 w-full text-gray-500 bg-primaryTwo border-t border-slate-900/5">
      <div className="max-padd-container">
        <div className="flex flex-wrap justify-between gap-12 md:gap-6">
          <div className="max-w-80">
            <div className="flex flex-1">
              {/* LOGO */}
              <Link to={"/"}>
                <img src={assets.logoImg} alt="logoImg" width={88} className="h-7" />
                <span className="text-textColor uppercase text-xs font-extrabold tracking-[6px] relative bottom-1">
                  CarRental
                </span>
              </Link>
            </div>
            <p className="text-sm pt-3">
              Trouvez des voitures fiables avec une tarification transparente. Nous offrons la
              meilleure expérience de location avec des véhicules de qualité et des tarifs honnêtes.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <img src={assets.facebook} alt="facebook" />
              <img src={assets.instagram} alt="instagram" />
              <img src={assets.twitter} alt="twitter" />
              <img src={assets.linkedin} alt="linkedin" />
            </div>
          </div>

          <div>
            <h4 className="text-textColor">ENTREPRISE</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a href="#">À propos</a>
              </li>
              <li>
                <a href="#">Carrières</a>
              </li>
              <li>
                <a href="#">Presse</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Partenaires</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text-textColor">ASSISTANCE</h4>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <a href="#">Centre d'aide</a>
              </li>
              <li>
                <a href="#">Informations de sécurité</a>
              </li>
              <li>
                <a href="#">Options d'annulation</a>
              </li>
              <li>
                <a href="#">Nous contacter</a>
              </li>
              <li>
                <a href="#">Accessibilité</a>
              </li>
            </ul>
          </div>

          <div className="max-w-80">
            <h4 className="text-text-textColor">RESTEZ À JOUR</h4>
            <p className="mt-3 text-sm">
              Inscrivez-vous à notre infolettre pour des inspirations et des offres spéciales.
            </p>
            <div className="flex items-center border pl-4 gap-2 bg-white border-gray-500/30 h-[46px] rounded-full overflow-hidden max-w-md w-full mt-6">
              <input
                type="text"
                className="w-full h-full outline-none text-sm text-gray-500"
                placeholder="Votre email"
              />
              <button className="btn-solid bg-black font-medium !px-3.5 py-2 mr-0.5">
                S'abonner
              </button>
            </div>
          </div>
        </div>
        <hr className="border-gray-300 mt-8" />
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5">
          <p>
            © {new Date().getFullYear()} <a>CarRental</a>. All rights reserved.
          </p>
          <ul className="flex items-center gap-4">
            <li>
              <a href="#">Confidentialité</a>
            </li>
            <li>
              <a href="#">Conditions</a>
            </li>
            <li>
              <a href="#">Plan du site</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
