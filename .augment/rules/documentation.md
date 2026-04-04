# Documentation Rules

## Folder Structure

Documentation lives close to the code it describes. Never put backend or frontend docs in the wrong folder.

| Doc file | Location | Describes |
|---|---|---|
| `requirements.md` | `docs/` | Project-wide implementation plan and rubric requirements |
| `git-workflow.md` | `docs/` | Branch naming, commit format, PR checklist |
| `api-reference.md` | `backend/docs/` | All REST endpoints — method, path, auth, request body, response shape |
| `data-models.md` | `backend/docs/` | Mongoose schemas — fields, types, constraints, relationships |
| `component-guide.md` | `frontend/docs/` | Route map, shared component props, Tailwind class conventions |

Do NOT create documentation files outside these locations without explicit user instruction.

## When to Update Docs

Update the relevant doc **in the same commit** as the code change that necessitates it:

- Adding or modifying a route → update `backend/docs/api-reference.md`
- Adding or modifying a Mongoose model → update `backend/docs/data-models.md`
- Adding or modifying a shared component or page route → update `frontend/docs/component-guide.md`
- Changing branch/commit/PR conventions → update `docs/git-workflow.md`

Never leave docs out of date at the end of a feature branch.

## api-reference.md Format

Each route section follows this table format:

```markdown
## <Entity> Routes (/api/<entity>)

| Method | Endpoint   | Auth  | Body / Query Params      | Success Response         |
|--------|------------|-------|--------------------------|--------------------------|
| GET    | /          | Admin | ?search=, ?category=     | [ { ...fields } ]        |
| GET    | /:id       | Admin | —                        | { ...fields }            |
| POST   | /          | Admin | { field1, field2, ... }  | { ...fields } (201)      |
| PUT    | /:id       | Admin | { field1, field2, ... }  | { ...fields }            |
| DELETE | /:id       | Admin | —                        | { message: '...' }       |

**Error responses:** `{ message: '...' }` with appropriate status (400, 401, 403, 404, 500)
```

## data-models.md Format

Each model section follows this table format:

```markdown
## <ModelName>

| Field     | Type     | Required | Constraints / Notes           |
|-----------|----------|----------|-------------------------------|
| name      | String   | ✅       | trim, maxlength 100           |
| price     | Number   | ✅       | min 0                         |
| category  | ObjectId | ✅       | ref: 'Category'               |
| createdAt | Date     | —        | default: Date.now             |
```

## component-guide.md Format

```markdown
## Route Map
| Route              | Component file     | Auth required |
|--------------------|--------------------|---------------|
| /login             | Login.jsx          | No            |
| /dashboard         | Dashboard.jsx      | Yes           |

## Shared Components
| Component          | Props                   | Purpose                        |
|--------------------|-------------------------|--------------------------------|
| ProtectedRoute.jsx | { children }            | Redirects to /login if no user |
| ProductForm.jsx    | { product?, onSubmit }  | Reusable add/edit form         |

## Tailwind Conventions
- Form input: `w-full p-2 border rounded mb-4`
- Primary button: `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700`
- Page wrapper: `max-w-4xl mx-auto p-6`
```

## Do Not

- Do **not** duplicate content across docs — if the README references endpoints, link to `backend/docs/api-reference.md` instead of copying the table
- Do **not** create new doc files (e.g. `CHANGELOG.md`, `CONTRIBUTING.md`) unless explicitly requested
- Do **not** put frontend docs in `backend/docs/` or vice versa
- Do **not** leave placeholder `...` sections in docs after the relevant code has been implemented
