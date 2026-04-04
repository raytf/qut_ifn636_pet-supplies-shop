# Git Workflow

## Branch Naming

```
feature/<short-description>   e.g. feature/category-crud
```

## Commit Message Format

```
<type>: <short description>

Types: feat | fix | docs | style | refactor | test | chore

Examples:
  feat: add Category model and CRUD routes
  fix: handle duplicate category name error
  docs: complete API reference for product routes
  test: add unit tests for categoryController
  chore: remove task manager placeholder files
```

## PR Checklist

- [ ] Branch is up to date with main
- [ ] All tests pass locally (`npm test` from `backend/`)
- [ ] No `console.log` left in production code
- [ ] No `.env` committed (only `.env.example`)
- [ ] PR title matches the feature branch purpose
- [ ] PR body has a 1–2 sentence description of what changed

## Branch → PR → Merge Flow

1. Branch off `main`: `git checkout -b feature/<name>`
2. Commit in small, atomic increments (one logical change per commit)
3. Push branch and open a PR against `main`
4. Verify GitHub Actions passes on the PR
5. Merge via PR — never push directly to `main`
