const HttpError = require('../models/http-error');
const { validationResult } = require("express-validator");
const User = require('../models/user');


const getUsers = async(req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); // -except password property
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later', 500);
    return next(error);
  }

  res.status(200).json({users: users.map(u => u.toObject({getters: true}))});
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, check data', 422));
  }

  const  { name, email, password} = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({email});

  } catch(err) {
    console.log(err)
    const error = new HttpError('Signing up failed, please try again later', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exisst already, please ligin istead', 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image: 'smth_image',
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err)

    const error = new HttpError("Signing up failed, pleace try again", 500);
    return next(error);
  }
  res.status(201).json({user: createdUser.toObject({getters: true})});
}

const login = async(req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email});

  } catch(err) {
    const error = new HttpError('logg in failed, please try again later', 500);
    return next(error);
  }

  if(!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credetials, could not log you in ', 500);
    return next(error);
  }
  res.json({message: 'Logged in'})
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;