const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customers');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(400).send('Not a valid customer id');
  res.send(customer);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone
  });

  customer = await customer.save();

  res.send(customer);
});

router.put('/:id', async (req, res) => {
  // check the customer submitted is valid
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isGold: req.body.isGold, name: req.body.name, phone: req.body.phone },
    { new: true }
  );

  if (!customer) return res.status(400).send('That customer id is not valid');

  res.send(customer);
});

router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndRemove({ _id: req.params.id });
  if (!customer) return res.status(400).send('That customer id is not valid');
  res.send(customer);
});

module.exports = router;
