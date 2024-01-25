# ROMI Project Scripts

## NPM Scripts

---

### Git Tasks

**push:** Push changes -- adds, commits, and pushes all changed files in one shot.

```bash
project-root % npm run push <required: commit-message>
```
*e.g.,* 
```bash
project-root % npm run push "updating the user registration templates"
```

---

### Dependency Tasks

**sync:** Get all of the necessary project dependencies for poetry/python and npm.

```bash
project-root % npm run sync
```

---

### Django Tasks

**start:** Start the server (from `project-root` or `project-root/romi`).

```bash
dir % npm run start
```

> **Notes:** This will also run `watch:tw` and `watch:lint` allowing for auto-reformatting during development.

**migrate:** Migrate model changes to the database. Runs makemigrations AND migrate.

```bash
project-root % npm run migrate <optional: app-name>
```

*e.g.,*
```bash
npm run migrate users
```

---

### Development Tasks

**tw:** Build the tailwind output file.

```bash
project-root/romi % npm run tw
```

**watch:tw:** Build tailwind output and watch for changes.

```bash
project-root/romi % npm run watch:tw
```

**lint:** Lint a file and (for HTML) get the lint feedback.

```bash
project-root/romi % npm run lint <required: relative-path-to-file>
```

*e.g.,*
```bash
npm run lint templates/main/programs.html
```

> **Notes:** The path should be relative to `project-root/romi`.

**watch:lint:** Watch for changes -- lint files when saved (HTML, CSS, JS, JSON).

```bash
project-root/romi % npm run watch:lint
```

---

## Git Hooks

We are using [husky](https://typicode.github.io/husky/) to manage our git hooks across branches.

### pre-commit

**Linting:** for (HTML, CSS, JS, JSON) files. Runs `npm run lint` on all files that have been changed.

> **Notes:** This will result in file changes, so you can view the updated formatting, and then commit again. 
This won't provide lint feedback (use `npm run watch` while making file changes to get feedback), since it uses `npx lint-staged`.

### post-merge

**Installations:** Gets required updates in the project dependencies. Runs `npm run sync`

> **Notes:** This only gets triggered _after_ merging, so if you have conflicts after pulling, they need to be resolved first.

---