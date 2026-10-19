# Sunbeam Arcade

Free browser games made by Sunshine and Lollipops. Plain HTML, no frameworks, no build tools beyond one small Node script.

## Folder structure

```
/
├── index.html                  Homepage. Lists every game automatically from games.json
├── privacy.html                Privacy page (add a contact email)
├── GAME-RULES.md               The rules every game follows. Give this to the game chats.
├── assets/
│   ├── site.css                Homepage styles (colours at the top)
│   └── favicon.svg
├── games/
│   ├── _template/              Starter game. Folders starting with _ are never published
│   └── <game-id>/              One folder per game: index.html + game.json (+ thumb.png)
├── scripts/
│   └── build-manifest.mjs      Scans /games, checks each one, writes games.json
└── .github/workflows/
    └── nightly-publish.yml     2am: merge drafts into main, which triggers the deploy
```

`games.json` is generated, never edited by hand (it's in `.gitignore`).

## One-time setup (about 20 minutes)

### 1. GitHub
1. Create a free account at github.com, then a new **public** repository (e.g. `sunbeam-arcade`).
2. Upload everything in this folder (drag and drop works: "Add file > Upload files"). Make sure the hidden `.github` folder goes up too; if drag and drop skips it, create `.github/workflows/nightly-publish.yml` with "Add file > Create new file" and paste the contents.
3. Create the `drafts` branch: click the branch dropdown (says `main`), type `drafts`, choose "Create branch".
4. Settings > Actions > General > Workflow permissions: choose **Read and write permissions** and Save.

### 2. Cloudflare Pages
1. Create a free account at cloudflare.com.
2. Workers & Pages > Create > Pages > Connect to Git, and pick the repository.
3. Build settings:
   - Production branch: `main`
   - Framework preset: None
   - Build command: `node scripts/build-manifest.mjs`
   - Build output directory: `/`
4. Deploy. You get a free `something.pages.dev` address straight away.
5. Optional: Custom domains > add your domain once you've bought it.

In Cloudflare, turn off preview deployments for `drafts` (Settings > Builds > Branch control > Production only) so unfinished games never get a public link.

### 3. Test it
GitHub > Actions > Nightly publish > Run workflow. It should say "Nothing new on drafts tonight" the first time.

## Adding a game

1. On GitHub, switch to the `drafts` branch.
2. Open the `games` folder, "Add file > Upload files", and upload a new folder (e.g. `lava-jump/` containing `index.html` and `game.json`).
3. Done. It goes live at about 2am.

Want it live now? Actions > Nightly publish > Run workflow.

## Pulling a game

- Not live yet: delete its folder on `drafts`.
- Already live: set `"status": "hidden"` in its `game.json` on `drafts` (gone after the next nightly run), or edit `main` directly for an immediate fix.

## Checking a game on your computer

From this folder run `node scripts/build-manifest.mjs`, then `npx serve .` and open the address it prints. (Opening `index.html` by double-clicking won't load the games list; browsers block that for local files.)

## If the nightly run fails

GitHub emails you. The usual causes:
- **Merge conflict:** the same file was edited on both `main` and `drafts`. Fix: on `drafts`, make the file match `main`, or always edit only on `drafts`.
- **No valid games:** every game.json is broken. The log names the folder and the problem.

The live site is never touched when a run fails.

## Changing the site name

Edit the `<title>` and `<h1>` in `index.html`, the `<title>` in `privacy.html`, and the heading in `GAME-RULES.md`.

## Turning on tips

In `index.html`, find `id="tip"`, paste your Ko-fi or Buy Me a Coffee link into `href`. The button appears automatically.
