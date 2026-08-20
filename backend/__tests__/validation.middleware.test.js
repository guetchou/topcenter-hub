jest.mock('../utils/logger', () => ({ error: jest.fn(), info: jest.fn() }));

const validate = require('../middleware/validation');

function makeResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('validation middleware', () => {
  test('accepts a valid login payload', () => {
    const req = { body: { email: 'user@example.com', password: 'secret' } };
    const res = makeResponse();
    const next = jest.fn();

    validate('login')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects an invalid login email', () => {
    const req = { body: { email: 'not-an-email', password: 'secret' } };
    const res = makeResponse();
    const next = jest.fn();

    validate('login')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects registration passwords shorter than six characters', () => {
    const req = {
      body: { email: 'user@example.com', password: '12345', fullName: 'Test User' },
    };
    const res = makeResponse();
    const next = jest.fn();

    validate('register')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid registration payload', () => {
    const req = {
      body: { email: 'user@example.com', password: '123456', fullName: 'Test User' },
    };
    const res = makeResponse();
    const next = jest.fn();

    validate('register')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
