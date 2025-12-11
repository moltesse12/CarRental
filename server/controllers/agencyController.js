import User from "../models/User.js";
import Agency from "../models/Agency.js";

// REGISTER A NEW AGENCY FOR THE LOGGED IN USER [POST '/agencies']

export const agencyReg = async (req, res) => {
  try {
    const { name, address, contact, email, city } = req.body;
    const owner = req.user._id;

    // Check if user already has an agency registered
    const agency = await Agency.findOne({ owner });
    if (agency) {
      return res.status(400).json({ message: "User already has an agency registered" });
    }

    await Agency.create({ name, address, contact, email, owner, city });
    await User.findByIdAndUpdate(owner, { role: "agencyOwner" });

    res.status(201).json({ success: true, message: "Agency registered successfully" });
  } catch (error) {
    console.error("Error registering agency:", error);
    res.status(500).json({ message: error.message });
  }
};
