const request = require('supertest');
const { Genre } = require('../../models/genres');
const { User } = require('../../models/users');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1' },
        { name: 'genre2' }
      ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const res = await request(server).get('/api/genres/' + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/genres/' + id);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if genre is less than 5 characters', async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();

      const genre = Genre.find({ name: 'genre1' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('PUT /:id', () => {
    it('should return 400 if genre is less than 5 characters', async () => {
      const genre = new Genre({ name: '12345' });
      genre.save();
      const res = await request(server)
        .put('/api/genres/' + genre._id)
        .send({ name: '1234' });

      expect(res.status).toBe(400);
    });

    it('should return 400 if genre is more than 50 characters', async () => {
      const name = new Array(52).join('a');
      const genre = new Genre({ name });
      const res = await request(server)
        .put('/api/genres/' + genre._id)
        .send({ name: name });

      expect(res.status).toBe(400);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server)
        .put('/api/genres/' + id)
        .send({ name: 'genre1' });

      expect(res.status).toBe(404);
    });

    it('should save the genre changes if it is valid', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      let res = await request(server)
        .put('/api/genres/' + genre._id)
        .send({ name: 'genre2' });

      res = await request(server).get('/api/genres/' + genre._id);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre2');
    });

    it('should return the genre if it is valid', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const res = await request(server)
        .put('/api/genres/' + genre._id)
        .send({ name: 'genre2' });

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre2');
    });
  });

  describe('DELETE /:id', () => {
    let token;
    let id;

    beforeEach(() => {
      token = new User().generateAuthToken();
      id = mongoose.Types.ObjectId();
    });

    const exec = async () => {
      return await request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token);
    };

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return 403 if client is not an admin', async () => {
      const user = new User({
        _id: id,
        name: 'Freddy',
        email: 'hobo@gmail.com',
        password: '123456',
        isAdmin: false
      });
      user.save();

      token = user.generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });
    it('should return 404 if no genre with the given id exists', async () => {
      const user = new User({
        _id: id,
        name: 'Freddy',
        email: 'hobo@gmail.com',
        password: '123456',
        isAdmin: true
      });
      user.save();

      token = user.generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(404);
    });
    it('should delete the genre from the db if it is valid', async () => {
      const user = new User({
        _id: id,
        name: 'Freddy',
        email: 'hobo@gmail.com',
        password: '123456',
        isAdmin: true
      });
      user.save();

      token = user.generateAuthToken();

      const genre = Genre({ name: 'genre1' });
      genre.save();

      const res = await request(server)
        .delete('/api/genres/' + genre.id)
        .set('x-auth-token', token);

      const getResult = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(getResult.body.length).toBe(0);
    });
  });
});
