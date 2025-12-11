//
export const getUserProfile = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;
    res.json({ succes: true, role, recentSearchedCities });
  } catch (error) {
    res.json({ succes: false, message: error.message });
  }
};

//
export const addRecentSearchedCity = async (req, res) => {
  try {
    const { recentSearchedCities } = req.body;
    const user = await req.user;
    
    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCities);
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchedCities);
    }
    res.json({ succes: true, role, message: "City added to recent searches" });
  } catch (error) {
    res.json({ succes: false, message: error.message });
  }
};
