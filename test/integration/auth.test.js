const { User } = require('../../models/users');
const { Genre } = require('../../models/genres');
const request = require('supertest');

let server;
let token;

describe('auth middleware', () => {
  beforeEach(() => {
    server = require('../../index');
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({}); // remove all objects to get empty collection
  });

  const exec = () => {
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });
  };

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = null;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
