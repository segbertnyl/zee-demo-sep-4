# Contributing

Internal prototype — New York Life × Huge. This is the working agreement for the team.

## 1. Get access (one-time)

1. An org admin adds you to the **HugeInternal** org and grants you Write access on **nylife-proto**.
2. Add your SSH key to GitHub, then **authorize it for the HugeInternal org**: GitHub → Settings → SSH and GPG keys → next to your key, *Configure SSO* → *Authorize* for HugeInternal.
   - SAML SSO is enforced. Skip this and `git clone`/`push` fails with a `SAML SSO` error — it's the #1 thing people miss.

## 2. Clone & run

Clone to a normal folder — **not** Dropbox, iCloud, or any synced directory. Sync services corrupt `.git` and `node_modules` mid-write.

```bash
git clone git@github.com:HugeInternal/nylife-proto.git
cd nylife-proto
npm install
npm run dev
```

For the multiplayer canvas locally, run `npm run collab` in a second terminal. (In deployed builds the app points at the hosted PartyKit server automatically.)

## 3. Branch → PR → main

- `main` is **protected and always deployable** — never push to it directly.
- Branch per change: `git checkout -b yourname/short-description`
- Open a PR into `main`. **CI runs the strict build + lint and must pass to merge.**
- Every PR gets an automatic Vercel **preview URL**, posted on the PR — share that for review.
- Merging to `main` **auto-deploys to production**.

## 4. Build discipline

`npm run build` is `tsc -b && vite build` and is **strict**: unused variables and type errors fail the build (and your PR). Run it locally before you push.

## Stack

React 19 · TypeScript · Vite · Tailwind 4 · Zustand · Motion. See the [README](README.md) for architecture and the scene guide.
