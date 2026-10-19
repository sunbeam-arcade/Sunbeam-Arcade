# Sunbeam Arcade: Game Rules

These are the parameters every game follows, so all games work on the website and are ready to submit to game portals (CrazyGames, itch.io, GameDistribution) without rework.

**For Claude in the game-making chats:** follow these rules for every game. Start from the template in `games/_template/index.html` (or recreate its shell: screen sizing, input, pause, mute, saving, loop). Change only the game section and the settings at the top. When a game is finished, hand over BOTH files below.

---

## 1. What a finished game looks like

Each game is one folder inside `/games`:

```
games/
  space-dodge/          <- folder name = the game's ID
    index.html          <- the whole game, one file
    game.json           <- title, creator, description (see below)
    thumb.png           <- optional cover picture, 16:10 (e.g. 640 x 400). If missing, one is
                           made automatically from a screenshot of the game at publish time.
```

**Folder name:** lowercase words joined with hyphens, no spaces. Example: `lava-jump`, `sun-catcher-2`. Must be unique and must match `GAME_ID` inside the game.

**game.json** (all fields in quotes, date as YYYY-MM-DD):

```json
{
  "title": "Lava Jump",
  "creator": "Sunshine",
  "description": "Jump from rock to rock before the lava rises. One sentence, written for kids.",
  "controls": "Tap to jump. Space bar on a computer.",
  "tags": ["platformer", "quick"],
  "orientation": "any",
  "added": "2026-10-20",
  "status": "live"
}
```

- `creator`: `"Sunshine"`, `"Lollipops"`, or `"Sunshine & Lollipops"` for a team game. These are the makers' public names.
- `orientation`: `"any"`, `"landscape"` or `"portrait"`
- `status`: `"live"` to show it, `"hidden"` to keep it off the homepage

If `game.json` is missing or broken, the game is skipped (never published half-made) and the nightly run shows a warning.

---

## 2. Technical rules (every game)

1. **One self-contained HTML file.** All code, styles, drawings and sounds inside `index.html`. No outside scripts, fonts, images, CDNs or network calls. Draw with canvas or SVG; make sounds with the Web Audio API.
2. **Fits any screen.** Phones, tablets and computers. Resizes when the window or phone rotates. No scroll bars, no pinch-zoom.
3. **Two ways to play.** Touch controls AND keyboard (or mouse). Touch buttons big enough for a kid's thumb (at least 48px).
4. **Starts with a Play button.** Title screen with name, one-line goal, controls and Play. Instructions must be visible without leaving the game.
5. **Pause.** Pause button, P or Esc to pause, and auto-pause when the tab is hidden or loses focus.
6. **Mute button.** Sound off and on. No sound at all until the player taps Play.
7. **Game over and play again.** Show the score and a Play again button. Save best score with `localStorage` using `GAME_ID` as a prefix, wrapped in try/catch.
8. **Fast.** Loads in under 2 seconds. Whole folder under 5 MB. Steady 60fps on an ordinary phone.
9. **No errors.** Nothing red in the browser console.
10. **Readable.** Text big and high contrast. Doesn't rely on colour alone (e.g. good vs bad items have different shapes too).

## 3. Safety and content rules (every game)

- Suitable for all ages. Cartoon bonks are fine; no blood, gore, scary jump-scares or mean words.
- No chat, no sign-up, no asking for names, ages, emails, photos or location.
- No ads, no buy buttons, no links out of the game. The only link is the Arcade back button.
- Original ideas, characters, names and art. No characters, logos, music or names from existing games, shows or brands (no Mario, Minecraft, Pokemon, etc.). Inspired-by gameplay is fine; copied looks are not.
- **Never use the kids' real names anywhere**: not in game text, credits, file names, comments, `game.json` or thumbnails. The makers are only ever "Sunshine" and "Lollipops". No school, suburb, age, photos or voices of the kids either.

## 4. Portal-ready rules (so the best games can earn on CrazyGames / itch.io)

- Works inside an iframe (no `window.top` tricks, no pop-ups, no new tabs).
- `PORTAL_BUILD = true` at the top of the game hides the Arcade link. That's the only change needed for a portal upload.
- No outside links, logos or "visit our site" messages inside the game.
- Plays well in landscape at 16:9 on desktop. Portrait-only games are harder to get accepted.
- A clear goal within 10 seconds of starting. Short rounds, quick restart.
- Thumbnail: bright, no small text, shows the main character or action.
- Before submitting, check that portal's current developer requirements; they change and some ask for their own SDK for ads or saving.

---

## 5. When a game is finished (save it to the project)

When the maker says the game is finished:

1. Play-test it once more against sections 2 to 4. Fix anything that fails before saving.
2. Save both files to this Claude project using the Projects tool (`project_write`), at exactly these paths:
   - `games/<game-id>/index.html`
   - `games/<game-id>/game.json`

   `<game-id>` is the folder name (lowercase-with-hyphens) and must match `GAME_ID` in the game. Set `"added"` in game.json to today's date and `"status": "live"`.
3. Saving an updated version to the same paths replaces the old one. Never save a half-finished game there. Work in progress stays in the chat.
4. Tell the maker: "Saved! It will be checked tonight and can go on Sunbeam Arcade after that."

Never save anything containing the makers' real names. If a game id is already taken by the other maker's game, add a number (e.g. `lava-jump-2`).

## 6. How a game goes live

1. Game made in a maker's chat, tested, and saved to the project (section 5).
2. Each evening a scheduled check copies new finished games to the `drafts` branch on GitHub.
3. Every night at 2am (Melbourne, daylight saving) the drafts are merged into `main`.
4. Cloudflare Pages sees the change, rebuilds the games list, and the game appears on the homepage with a NEW badge for 14 days.

To pull a game before it goes live: delete its folder from `drafts`, or set `"status": "hidden"`.
