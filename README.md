# CS4135 FOMO — Frontend (Person 1)

This branch/commit contains the **frontend lead** work:

- Vite + React + TypeScript tooling  
- App shell, layout, routing  
- API client (`apiClient`, `fomoApi`), Redux auth  
- Protected routes  
- **Feed** (`HomePage`), **post detail** (`PostPage`), **login / register**, **profile**

`App.tsx` and `Layout.tsx` only wire the routes above so the project builds before Person 2 adds search, messages, groups, etc. Person 2 merges the remaining pages and restores full navigation.

## Run locally

```bash
npm install
npm run dev
```

Point `VITE_API_BASE` at your backend if not using the Vite proxy (see `.env.example`).
