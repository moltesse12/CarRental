import React, { useState } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import toast from "react-hot-toast";

const AddCar = () => {
  const { axios, getToken } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    country: "",
    address: "",
    odometer: "",
    bodyType: "",
    transmission: "",
    seats: "",
    fuelType: "",
    rentPrice: "",
    salePrice: "",
    features: "",
    images: [],
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData to handle file uploads
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("city", formData.city);
      form.append("country", formData.country);
      form.append("address", formData.address);
      form.append("odometer", formData.odometer);
      form.append("bodyType", formData.bodyType);
      form.append("transmission", formData.transmission);
      form.append("seats", formData.seats);
      form.append("fuelType", formData.fuelType);
      form.append("rentPrice", formData.rentPrice);
      form.append("salePrice", formData.salePrice);
      form.append("features", formData.features);

      // Append images
      formData.images.forEach(image => {
        form.append("images", image);
      });

      const { data } = await axios.post("/api/cars", form, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message || "Voiture ajoutée avec succès !");
        // Reset form
        setFormData({
          title: "",
          description: "",
          city: "",
          country: "",
          address: "",
          odometer: "",
          bodyType: "",
          transmission: "",
          seats: "",
          fuelType: "",
          rentPrice: "",
          salePrice: "",
          features: "",
          images: [],
        });
      } else {
        toast.error(data.message || "Impossible d'ajouter la voiture");
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'ajout de la voiture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:px-8 py-6 xl:py-8 m-1 sm:m-3 h-[97vh] overflow-y-scroll lg:w-11/12 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Ajouter une nouvelle voiture</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la voiture</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. Toyota Camry 2023"
            />
          </div>

          {/* Type de carrosserie */}
          <div>
            <label className="block text-sm font-medium mb-1">Type de carrosserie</label>
            <select
              name="bodyType"
              value={formData.bodyType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Sélectionnez le type de carrosserie</option>
              <option value="Sedan">Berline</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupé</option>
              <option value="Van">Monospace</option>
              <option value="Truck">Camion</option>
              <option value="Hatchback">Berline compacte</option>
            </select>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium mb-1">Ville</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. New York"
            />
          </div>

          {/* Pays */}
          <div>
            <label className="block text-sm font-medium mb-1">Pays</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. USA"
            />
          </div>

          {/* Adresse */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Adresse de rue"
            />
          </div>

          {/* Compteur kilométrique */}
          <div>
            <label className="block text-sm font-medium mb-1">Compteur kilométrique (km)</label>
            <input
              type="number"
              name="odometer"
              value={formData.odometer}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. 5000"
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium mb-1">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Sélectionnez la transmission</option>
              <option value="Manual">Manuelle</option>
              <option value="Automatic">Automatique</option>
            </select>
          </div>

          {/* Sièges */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de sièges</label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. 5"
            />
          </div>

          {/* Type de carburant */}
          <div>
            <label className="block text-sm font-medium mb-1">Type de carburant</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Sélectionnez le type de carburant</option>
              <option value="Petrol">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Électrique</option>
              <option value="Hybrid">Hybride</option>
            </select>
          </div>

          {/* Prix de location journalière */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Prix de location journalière ($)
            </label>
            <input
              type="number"
              name="rentPrice"
              value={formData.rentPrice}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. 50"
            />
          </div>

          {/* Prix de vente */}
          <div>
            <label className="block text-sm font-medium mb-1">Prix de vente ($)</label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="ex. 25000"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Description de la voiture et caractéristiques"
          />
        </div>

        {/* Caractéristiques */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Caractéristiques (séparées par des virgules)
          </label>
          <input
            type="text"
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="ex. Climatisation, Direction assistée, Freins ABS"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">Images de la voiture</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          {formData.images.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {formData.images.length} image(s) sélectionnée(s)
            </p>
          )}
        </div>

        {/* Bouton de soumission */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Ajout en cours..." : "Ajouter une voiture"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCar;
