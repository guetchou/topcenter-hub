const jwt = require('jsonwebtoken');

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

const auth = require('../middleware/auth');

function makeResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('auth middleware', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    jest.clearAllMocks();
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  test('rejects requests without a token', () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = makeResponse();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('fails closed when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    const req = { header: jest.fn().mockReturnValue('token') };
    const res = makeResponse();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects invalid tokens', () => {
    process.env.JWT_SECRET = 'test-secret';
    const req = { header: jest.fn().mockReturnValue('not-a-valid-token') };
    const res = makeResponse();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts a valid token and attaches decoded user', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: 42, role: 'admin' }, process.env.JWT_SECRET);
    const req = { header: jest.fn().mockReturnValue(token) };
    const res = makeResponse();
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ id: 42, role: 'admin' }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
