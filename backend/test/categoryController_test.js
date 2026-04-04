const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Category = require('../models/Category');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

// ---------------------------------------------------------------------------
// getCategories
// ---------------------------------------------------------------------------
describe('getCategories', () => {
    it('should return all categories with status 200', async () => {
        // 1. Stub
        const fakeCategories = [
            { _id: new mongoose.Types.ObjectId(), name: 'Dogs', description: 'Dog supplies' },
            { _id: new mongoose.Types.ObjectId(), name: 'Cats', description: 'Cat supplies' },
        ];
        const sortStub = sinon.stub().resolves(fakeCategories);
        const findStub = sinon.stub(Category, 'find').returns({ sort: sortStub });

        // 2. Mock req/res
        const req = {};
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getCategories(req, res);

        // 4. Assert
        expect(res.status.called).to.be.false;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.calledWith(fakeCategories)).to.be.true;

        // 5. Restore
        findStub.restore();
    });

    it('should return 500 if a database error occurs', async () => {
        // 1. Stub
        const sortStub = sinon.stub().throws(new Error('DB Error'));
        const findStub = sinon.stub(Category, 'find').returns({ sort: sortStub });

        // 2. Mock req/res
        const req = {};
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getCategories(req, res);

        // 4. Assert
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// getCategory
// ---------------------------------------------------------------------------
describe('getCategory', () => {
    it('should return 404 if the category is not found', async () => {
        // 1. Stub
        const findStub = sinon.stub(Category, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Category not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// createCategory
// ---------------------------------------------------------------------------
describe('createCategory', () => {
    it('should create a category and return 201', async () => {
        // 1. Stub
        const fakeCategory = { _id: new mongoose.Types.ObjectId(), name: 'Birds', description: 'Bird supplies' };
        const createStub = sinon.stub(Category, 'create').resolves(fakeCategory);

        // 2. Mock req/res
        const req = { body: { name: 'Birds', description: 'Bird supplies' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(fakeCategory)).to.be.true;

        // 5. Restore
        createStub.restore();
    });

    it('should return 400 if name is missing', async () => {
        // 1. No stub needed — validation fires before any DB call
        // 2. Mock req/res
        const req = { body: {} };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'Category name is required' })).to.be.true;
    });

    it('should return 500 if a database error occurs', async () => {
        // 1. Stub
        const createStub = sinon.stub(Category, 'create').throws(new Error('DB Error'));

        // 2. Mock req/res
        const req = { body: { name: 'Fish' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // 5. Restore
        createStub.restore();
    });
});

// ---------------------------------------------------------------------------
// updateCategory
// ---------------------------------------------------------------------------
describe('updateCategory', () => {
    it('should return 404 if the category is not found', async () => {
        // 1. Stub
        const findStub = sinon.stub(Category, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: 'Updated' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await updateCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Category not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// deleteCategory
// ---------------------------------------------------------------------------
describe('deleteCategory', () => {
    it('should return 404 if the category is not found', async () => {
        // 1. Stub
        const findStub = sinon.stub(Category, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await deleteCategory(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Category not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});
