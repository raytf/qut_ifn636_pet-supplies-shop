const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const User = require('../models/User');
const { getUsers, getProfile } = require('../controllers/authController');

// ---------------------------------------------------------------------------
// getUsers
// ---------------------------------------------------------------------------
describe('getUsers', () => {
  it('should return all users with status 200', async () => {
    // 1. Stub
    const fakeUsers = [
      { _id: new mongoose.Types.ObjectId(), name: 'Admin User', email: 'admin@petopia.com', role: 'admin' },
      { _id: new mongoose.Types.ObjectId(), name: 'Jane Doe',   email: 'jane@example.com',  role: 'customer' },
    ];
    const selectStub = sinon.stub().resolves(fakeUsers);
    const findStub   = sinon.stub(User, 'find').returns({ select: selectStub });

    // 2. Mock req/res
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    // 3. Call
    await getUsers(req, res);

    // 4. Assert
    expect(res.status.called).to.be.false;     // no error status set
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith(fakeUsers)).to.be.true;

    // 5. Restore
    findStub.restore();
  });

  it('should return 500 if a database error occurs', async () => {
    // 1. Stub
    const selectStub = sinon.stub().throws(new Error('DB Error'));
    const findStub   = sinon.stub(User, 'find').returns({ select: selectStub });

    // 2. Mock req/res
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    // 3. Call
    await getUsers(req, res);

    // 4. Assert
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // 5. Restore
    findStub.restore();
  });
});

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------
describe('getProfile', () => {
  it('should return the authenticated user profile', async () => {
    // 1. Stub
    const userId   = new mongoose.Types.ObjectId();
    const fakeUser = { id: userId, name: 'Admin User', email: 'admin@petopia.com', role: 'admin', createdAt: new Date() };
    const findStub = sinon.stub(User, 'findById').resolves(fakeUser);

    // 2. Mock req/res
    const req = { user: { id: userId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    // 3. Call
    await getProfile(req, res);

    // 4. Assert
    expect(res.status.called).to.be.false;    // no error status set
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.args[0][0]).to.include({ email: 'admin@petopia.com', role: 'admin' });

    // 5. Restore
    findStub.restore();
  });

  it('should return 404 if the user is not found', async () => {
    // 1. Stub
    const findStub = sinon.stub(User, 'findById').resolves(null);

    // 2. Mock req/res
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    // 3. Call
    await getProfile(req, res);

    // 4. Assert
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'User not found' })).to.be.true;

    // 5. Restore
    findStub.restore();
  });

  it('should return 500 if a database error occurs', async () => {
    // 1. Stub
    const findStub = sinon.stub(User, 'findById').throws(new Error('DB Error'));

    // 2. Mock req/res
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    // 3. Call
    await getProfile(req, res);

    // 4. Assert
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // 5. Restore
    findStub.restore();
  });
});
