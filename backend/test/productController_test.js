const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Product = require('../models/Product');
const Category = require('../models/Category');
const { getProducts, createProduct, deleteProduct, getProduct, updateProduct } = require('../controllers/productController');

// Helper to build a chainable stub for Product.find().populate().sort()
const buildFindChain = (resolvedValue) => {
    const sortStub    = sinon.stub().resolves(resolvedValue);
    const populateStub = sinon.stub().returns({ sort: sortStub });
    return { stub: sinon.stub(Product, 'find').returns({ populate: populateStub }), sortStub, populateStub };
};

// ---------------------------------------------------------------------------
// getProducts
// ---------------------------------------------------------------------------
describe('getProducts', () => {
    it('should return all products with status 200', async () => {
        // 1. Stub
        const fakeProducts = [
            { _id: new mongoose.Types.ObjectId(), name: 'Dog Food', price: 29.99, category: { name: 'Dogs' } },
        ];
        const { stub } = buildFindChain(fakeProducts);

        // 2. Mock req/res
        const req = { query: {} };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getProducts(req, res);

        // 4. Assert
        expect(res.status.called).to.be.false;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.calledWith(fakeProducts)).to.be.true;

        // 5. Restore
        stub.restore();
    });

    it('should apply search filter when ?search= is provided', async () => {
        // 1. Stub
        const { stub } = buildFindChain([]);

        // 2. Mock req/res
        const req = { query: { search: 'cat' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getProducts(req, res);

        // 4. Assert — find was called with a regex filter on name
        expect(stub.calledOnce).to.be.true;
        const filterArg = stub.args[0][0];
        expect(filterArg).to.have.property('name');
        expect(filterArg.name.$regex).to.equal('cat');

        // 5. Restore
        stub.restore();
    });

    it('should return 500 if a database error occurs', async () => {
        // 1. Stub — make the chain throw at sort
        const sortStub     = sinon.stub().throws(new Error('DB Error'));
        const populateStub = sinon.stub().returns({ sort: sortStub });
        const findStub     = sinon.stub(Product, 'find').returns({ populate: populateStub });

        // 2. Mock req/res
        const req = { query: {} };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getProducts(req, res);

        // 4. Assert
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// getProduct
// ---------------------------------------------------------------------------
describe('getProduct', () => {
    it('should return 404 if product is not found', async () => {
        // 1. Stub
        const populateStub = sinon.stub().resolves(null);
        const findStub = sinon.stub(Product, 'findById').returns({ populate: populateStub });

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await getProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Product not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// createProduct
// ---------------------------------------------------------------------------
describe('createProduct', () => {
    it('should create a product and return 201', async () => {
        // 1. Stub
        const categoryId  = new mongoose.Types.ObjectId();
        const fakeProduct = {
            _id: new mongoose.Types.ObjectId(), name: 'Cat Toy', price: 9.99,
            category: categoryId, stock: 10,
            populate: sinon.stub().resolves({ name: 'Cat Toy', category: { name: 'Cats' } }),
        };
        const catStub     = sinon.stub(Category, 'findById').resolves({ _id: categoryId, name: 'Cats' });
        const createStub  = sinon.stub(Product, 'create').resolves(fakeProduct);

        // 2. Mock req/res
        const req = { body: { name: 'Cat Toy', price: 9.99, category: categoryId.toString(), stock: 10 } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;

        // 5. Restore
        catStub.restore();
        createStub.restore();
    });

    it('should return 400 if required fields are missing', async () => {
        // 1. No stub needed — validation fires before DB
        const req = { body: { name: 'Cat Toy' } }; // missing price and category
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'Name, price, and category are required' })).to.be.true;
    });

    it('should return 400 if the referenced category does not exist', async () => {
        // 1. Stub — category lookup returns null
        const catStub = sinon.stub(Category, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { body: { name: 'Cat Toy', price: 9.99, category: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'Referenced category does not exist' })).to.be.true;

        // 5. Restore
        catStub.restore();
    });

    it('should return 500 if a database error occurs', async () => {
        // 1. Stub
        const catStub    = sinon.stub(Category, 'findById').resolves({ _id: new mongoose.Types.ObjectId() });
        const createStub = sinon.stub(Product, 'create').throws(new Error('DB Error'));

        // 2. Mock req/res
        const req = { body: { name: 'Cat Toy', price: 9.99, category: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await createProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // 5. Restore
        catStub.restore();
        createStub.restore();
    });
});

// ---------------------------------------------------------------------------
// deleteProduct
// ---------------------------------------------------------------------------
describe('deleteProduct', () => {
    it('should return 404 if the product is not found', async () => {
        // 1. Stub
        const findStub = sinon.stub(Product, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await deleteProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Product not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });

    it('should return 500 if a database error occurs', async () => {
        // 1. Stub
        const findStub = sinon.stub(Product, 'findById').throws(new Error('DB Error'));

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await deleteProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});

// ---------------------------------------------------------------------------
// updateProduct
// ---------------------------------------------------------------------------
describe('updateProduct', () => {
    it('should return 404 if the product is not found', async () => {
        // 1. Stub
        const findStub = sinon.stub(Product, 'findById').resolves(null);

        // 2. Mock req/res
        const req = { params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: 'Updated' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        // 3. Call
        await updateProduct(req, res);

        // 4. Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWith({ message: 'Product not found' })).to.be.true;

        // 5. Restore
        findStub.restore();
    });
});
