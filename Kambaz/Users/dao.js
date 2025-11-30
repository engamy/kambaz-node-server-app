import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function UsersDao() {

  const createUser = (user) => {
  const newUser = { ...user, _id: uuidv4() };
  return model.create(newUser);
}  

  const findAllUsers = async () => await model.find();

  const findUserById = async (userId) => await model.findById(userId);

  const findUserByUsername = async (username) => await model.findOne({ username: username });

  const findUserByCredentials = async (username, password) => await model.findOne({ username, password });

  const updateUser = async (userId, user) => {
    await model.updateOne({ _id: userId }, { $set: user });
    return await model.findById(userId);
  };

  const deleteUser = (userId) => model.findByIdAndDelete( userId );
  
  const findUsersByRole = (role) => model.find({ role: role }); 

  const findUsersByPartialName = (partialName) => {
    const regex = new RegExp(partialName, "i"); // 'i' makes it case-insensitive
    return model.find({
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    });
  };    

  return { createUser, findAllUsers, findUserById, findUserByUsername, 
    findUserByCredentials, updateUser, deleteUser, findUsersByRole, 
    findUsersByPartialName};
}
