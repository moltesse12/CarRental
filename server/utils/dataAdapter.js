// Adaptateur pour transformer les données PostgreSQL en format compatible avec le frontend MongoDB

/**
 * Transforme une voiture PostgreSQL en format frontend
 */
export const adaptCar = (car) => {
  if (!car) return null;

  return {
    _id: car.id,
    title: car.title,
    description: car.description,
    city: car.city,
    country: car.country || '',
    address: car.address || '',
    odometer: car.odometer || 0,
    bodyType: car.body_type || car.bodyType,
    price: {
      rent: car.price_rent || car.price?.rent || 0,
      sale: car.price_sale || car.price?.sale || 0,
    },
    specs: {
      transmission: car.transmission || '',
      seats: car.seats || 0,
      fuelType: car.fuel_type || car.fuelType || '',
    },
    features: Array.isArray(car.features) ? car.features : (car.features ? JSON.parse(car.features) : []),
    images: (() => {
      if (Array.isArray(car.images)) {
        const mapped = car.images.map(img => {
          if (typeof img === 'object' && img !== null) {
            return img.url || img.image_url || '';
          }
          return typeof img === 'string' ? img : '';
        }).filter(img => img !== '');
        return mapped.length > 0 ? mapped : ['https://via.placeholder.com/400'];
      }
      if (car.images && typeof car.images === 'string') {
        try {
          const parsed = JSON.parse(car.images);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map(img => typeof img === 'object' && img.url ? img.url : img).filter(img => img);
            return mapped.length > 0 ? mapped : ['https://via.placeholder.com/400'];
          }
          return [parsed];
        } catch {
          return car.images ? [car.images] : ['https://via.placeholder.com/400'];
        }
      }
      if (car.main_image) {
        return [car.main_image];
      }
      // Image par défaut si aucune image
      return ['https://via.placeholder.com/400'];
    })(),
    isAvailable: car.is_available !== undefined ? car.is_available : car.isAvailable,
    agency: (() => {
      if (!car.agency && !car.agency_name) return null;

      const agency = car.agency || {};
      return {
        _id: agency.id || car.agency_id,
        name: agency.name || car.agency_name || '',
        email: agency.email || car.agency_email || '',
        contact: agency.contact || '',
        address: agency.address || '',
        city: agency.city || '',
        mail: agency.email || car.agency_email || '', // Pour compatibilité frontend
        owner: agency.owner ? {
          _id: agency.owner.id || agency.owner._id,
          username: agency.owner.username || '',
          email: agency.owner.email || '',
          image: agency.owner.image || '',
        } : (agency.ownerId ? {
          _id: agency.ownerId,
        } : null),
      };
    })(),
    createdAt: car.created_at,
    updatedAt: car.updated_at,
  };
};

/**
 * Transforme une liste de voitures
 */
export const adaptCars = (cars) => {
  if (!Array.isArray(cars)) return [];
  return cars.map(adaptCar);
};

/**
 * Transforme une réservation PostgreSQL en format frontend
 */
export const adaptBooking = (booking) => {
  if (!booking) return null;

  // Si booking.car est un objet JSON (depuis json_build_object), l'adapter
  let carData = null;
  if (booking.car && typeof booking.car === 'object' && !Array.isArray(booking.car)) {
    // Gérer les images
    let images = [];
    if (Array.isArray(booking.car.images)) {
      images = booking.car.images.map(img => typeof img === 'object' && img.url ? img.url : img).filter(img => img);
    } else if (booking.car.images) {
      images = [booking.car.images];
    }
    if (images.length === 0) {
      images = ['https://via.placeholder.com/400'];
    }

    carData = {
      _id: booking.car.id || booking.car_id,
      title: booking.car.title || '',
      city: booking.car.city || '',
      address: booking.car.address || '',
      bodyType: booking.car.bodyType || booking.car.body_type || '',
      specs: {
        seats: booking.car.seats || 0,
        transmission: booking.car.transmission || '',
        fuelType: booking.car.fuelType || booking.car.fuel_type || '',
      },
      images: images,
      price: {
        rent: booking.car.priceRent || booking.car.price_rent || 0,
        sale: 0,
      },
    };
  } else if (booking.car_id) {
    carData = {
      _id: booking.car_id,
      title: '',
      images: ['https://via.placeholder.com/400'],
      specs: { seats: 0, transmission: '', fuelType: '' },
      price: { rent: 0, sale: 0 }
    };
  }

  return {
    _id: booking.id,
    user: booking.user_id || booking.user,
    car: carData,
    agency: booking.agency_id || booking.agency,
    pickUpDate: booking.pick_up_date || booking.pickUpDate,
    dropOffDate: booking.drop_off_date || booking.dropOffDate,
    totalPrice: booking.total_price || booking.totalPrice || 0,
    status: booking.status || 'pending',
    isPaid: booking.is_paid !== undefined ? booking.is_paid : (booking.isPaid !== undefined ? booking.isPaid : false),
    paymentMethod: booking.payment_method || booking.paymentMethod || '',
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
};

/**
 * Transforme une liste de réservations
 */
export const adaptBookings = (bookings) => {
  if (!Array.isArray(bookings)) return [];
  return bookings.map(adaptBooking);
};

/**
 * Transforme un utilisateur PostgreSQL en format frontend
 */
export const adaptUser = (user) => {
  if (!user) return null;

  return {
    _id: user.id,
    username: user.username,
    email: user.email,
    image: user.image || '',
    role: user.role || 'user',
    recentSearchedCities: user.recent_searches
      ? user.recent_searches.map(s => s.city || s)
      : (user.recentSearchedCities || []),
  };
};
