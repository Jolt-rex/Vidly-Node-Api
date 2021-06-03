const validateObjectId = require('../middleware/validObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genres');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const genre = await Genre.find().sort('name');
  res.header('Access-Control-Allow-Origin', '*');
  res.send(genre);
});

router.get('/:id', validateObjectId, async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('That genre id is not valid');
  res.send(genre);
});

router.post('/', auth, async (req, res) => {
  // validate the posted data
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();

  res.send(genre);
});

router.put('/:id', async (req, res) => {
  // check the genre submitted is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) return res.status(404).send('That genre id is not valid');

  res.send(genre);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndRemove({ _id: req.params.id });
  if (!genre) return res.status(404).send('That genre id is not valid');
  res.send(genre);
});

module.exports = router;
