# Unit Testing Rules

## Stack
- **Test runner:** Mocha
- **Assertions:** Chai (`expect` style)
- **HTTP testing:** Chai-HTTP
- **Mocking/stubbing:** Sinon
- **Test location:** `backend/test/`

## File & Naming Conventions
- Place all test files in `backend/test/`
- Name files descriptively: `<feature>_test.js` (e.g. `example_test.js`)
- Run tests with `npm test` from the `backend/` directory

## Imports
Always import at the top of the file in this order:
```js
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
chai.use(chaiHttp);
// Import the model and controller functions being tested
const Task = require('../models/Task');
const { addTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
```

## Test Structure
Group tests by function using `describe`, with one `it` block per scenario:
```js
describe('FunctionName Test', () => {
  it('should <success scenario>', async () => { ... });
  it('should return 404 if <not found scenario>', async () => { ... });
  it('should return 500 if an error occurs', async () => { ... });
});
```

## The 5-Step Pattern (use in every test)
Every `it` block must follow this exact order:

1. **Stub** — Replace the real DB call with a fake using Sinon
2. **Mock** — Create fake `req` and `res` objects
3. **Call** — Invoke the real controller function
4. **Assert** — Check the response status and body
5. **Restore** — Always restore stubs at the end

```js
it('should create a new task successfully', async () => {
  // 1. Stub
  const createStub = sinon.stub(Task, 'create').resolves(createdTask);

  // 2. Mock req/res
  const req = { user: { id: new mongoose.Types.ObjectId() }, body: { title: 'New Task' } };
  const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

  // 3. Call
  await addTask(req, res);

  // 4. Assert
  expect(res.status.calledWith(201)).to.be.true;
  expect(res.json.calledWith(createdTask)).to.be.true;

  // 5. Restore
  createStub.restore();
});
```

## Mocking req and res
Always construct `req` and `res` manually — never use real HTTP requests for unit tests:
```js
const req = {
  user: { id: new mongoose.Types.ObjectId() }, // for auth-protected routes
  params: { id: someId },                       // for routes with URL params
  body: { title: 'Task', description: '...' }   // for POST/PUT body data
};

const res = {
  status: sinon.stub().returnsThis(), // allows chaining: res.status(404).json(...)
  json: sinon.spy()                   // records what was sent back
};
```

## Sinon Stubs — Cheatsheet
| Scenario | Sinon Code |
|---|---|
| DB returns data | `sinon.stub(Model, 'method').resolves(data)` |
| DB returns nothing | `sinon.stub(Model, 'method').resolves(null)` |
| DB throws an error | `sinon.stub(Model, 'method').throws(new Error('DB Error'))` |
| Mock `.save()` on a document | `save: sinon.stub().resolvesThis()` |
| Mock `.remove()` on a document | `remove: sinon.stub().resolves()` |

## Required Test Cases Per Controller Function
Every controller function must have at minimum:
- ✅ **Happy path** — succeeds and returns the correct status + data
- ❌ **Not found** — returns `404` when the resource doesn't exist (for find/update/delete)
- ❌ **Server error** — returns `500` when the DB throws an error

## Assertions — What to Always Check
```js
// Check status code
expect(res.status.calledWith(201)).to.be.true;

// Check response body exactly
expect(res.json.calledWith({ message: 'Task deleted' })).to.be.true;

// Check response body partially (useful for errors)
expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

// Check a stub was called with the right arguments
expect(stub.calledOnceWith(expectedArg)).to.be.true;

// Check no error status was set on a happy path
expect(res.status.called).to.be.false;
```

## Do Not
- Do **not** connect to a real database in unit tests — always stub DB calls
- Do **not** start the Express server in unit tests — call controller functions directly
- Do **not** leave stubs unrestore — always call `stub.restore()` at the end of each test
