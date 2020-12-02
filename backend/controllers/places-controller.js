const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId); // not real promise
  } catch (err) {
    const error = new HttpError("Smth went wrong, could not find place", 500);
    return next(error);
  }

  if (!place) {
    const error =  new HttpError("Could not find a place for provided pid", 404);
    return next(error);
  }
  res.status(200).json({ place: place.toObject({getters: true}) });  // return simple js object
  // res.status(200).json({ place: place });

};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    // places = await Place.find({creator: userId});
    userWithPlaces = await User.findById(userId).populate('places');

  } catch (err) {
    const error = new HttpError('Fetching places failed, please try later', 500);
    return next(error);
  }

  // if(!places || places.length === 0 ) {}
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("Could not find a places for provided uid", 404));
  }

  res.status(200).json({ places: userWithPlaces.places.map(place => place.toObject({getters: true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, check data", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "smth_dtrinh",
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("We could not find user for provided id", 500);
    return next(error);
  }

  console.log(user);


  try {
    // await createdPlace.save();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session: sess});
    user.places.push(createdPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, pleace try again", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     next(new HttpError("Invalid inputs passed, check data", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch(err) {
    console.log(err);
    const error =  new HttpError("Could not update a place for provided pid", 500);
    return next(error);
  }
  
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch(err) {
    const error =  new HttpError("Something went wrong, could update place", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({getters: true}) });
};

const deletePlaceById = async(req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch(err) {
    const error =  new HttpError("Could delete place", 500);
    return next(error);
  }

  if(!place) {
    const error =  new HttpError("Could find place for this id", 404);
    return next(error);
  }


  try {
    // await place.remove();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session: sess});
    place.creator.places.pull(place);

    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch(err) {
    const error =  new HttpError("Something went wrong, could not delete place", 500);
    return next(error);
  }

  res.status(200).json({ message: "Deletes succefully!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
