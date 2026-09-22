# Suggested Git Commits

Run from the admin frontend repository. Do not commit `.env.local`.

```bash
git add package.json package-lock.json .gitignore .env.example tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs proxy.ts app/layout.tsx app/globals.css app/icon.svg app/page.tsx
git commit -m "setup admin frontend project"
```

```bash
git add src/shared/api src/shared/auth src/shared/lib src/shared/types src/shared/ui
git commit -m "SCRUM-40 add role based frontend auth foundation"
```

```bash
git add app/staff src/views/auth src/widgets/auth
git commit -m "add owner staff and technician authentication screens"
```

```bash
git add app/dashboard src/views/dashboard src/widgets/dashboard
git commit -m "SCRUM-40 add role based dashboard navigation"
```

```bash
git add app/technicians src/views/technicians src/widgets/technicians
git commit -m "SCRUM-43 add technician management interface"
```

```bash
git add app/profile src/views/profile README.md docs
git commit -m "add internal profile and frontend documentation"
```
