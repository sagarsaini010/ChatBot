import user from  "../models/user.model.js";

export const findUserByEmail = async (email) => {
  return await user.findOne({ email });
};

export const createUser = async (userData) => {
  const newUser = new user(userData);
  return await newUser.save();
};