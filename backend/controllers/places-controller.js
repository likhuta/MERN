const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  }
]

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);
  
  if (!place) {
    throw new HttpError('Could not find a place for provided pid', 404);
  } 
  res.status(200).json({place});
};


const getPlacesByUserId =  (req, res, next) => {
  // console.log('Get request in places');
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);
  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for provided uid', 404)
    );
  } 

  res.status(200).json({places});
};


const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator} = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace});

}

const updatePlaceById = (req, res, next) => {
  const { title, description} = req.body;
  const placeId = req.params.pid;
  const updatedPlace ={ ...DUMMY_PLACES.find(p => p.id === placeId)};
  const placeIndx =DUMMY_PLACES.findIndex(p => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndx] = updatedPlace;

  res.status(200).json({ place: DUMMY_PLACES[placeIndx]});
}

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: 'Deletes succefully!'});
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
