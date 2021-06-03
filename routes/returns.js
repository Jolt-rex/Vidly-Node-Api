const Joi = require('Joi');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rentals');
const { Movie } = require('../models/movies');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found');

  if (rental.dateReturned)
    return res.status(400).send('Rental already returned');

  rental.return();
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movieId },
    {
      $inc: { numberInStock: 1 }
    }
  );

  return res.send(rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
