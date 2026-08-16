# How index.html's terminal works

`index.html` is one hand-authored file (no build step, no `GENERATED:*`
blocks outside the small ABOUT/SKILLS/SOCIALS markers — see
[UPDATE-GUIDE.md](UPDATE-GUIDE.md)) that simulates an interactive shell.
This doc is the map for the ~2000 lines of JS behind it: how a keystroke
turns into output, what each self-contained joke/system does, and a full
command reference at the end.

## Command dispatch and the mode state machine

Everything funnels through **`runCommand(raw)`**. The first thing it does
is check a single module-level `mode` variable, which is one of:

- `'shell'` — the default. Falls through to a big `switch(base)` matching
  each built-in command (`about`, `skills`, `ls`, `sudo`, `ssh`, ...).
- `'ssh'` — set by `enterPersonaMode()` after a successful `ssh <host>`.
  Input is redirected to `runPersonaCommand()` instead of the normal
  switch, for as long as this mode is active.
- `'top'` — set by `enterTopMode()` after running `top`. Input goes to
  `runTopCommand()`, which only understands `q`/`exit`/`quit`.

Entering/leaving `'ssh'`/`'top'` always follows the same shape: set
`mode`, call `updatePromptUI()` (so the `guest@nikita.sh $` prompt
reflects the new context — e.g. `recruiter@nikita.sh $` while sshed in),
and do any mode-specific setup. `top` additionally starts a
`setInterval` that re-renders the process table every 1.2s
(`refreshTopView`), cleared again on exit.

There's no separate mode for the `sudo rm -rf /` panic effect — it's a
one-shot sequence that runs to completion inline from the `sudo` case,
toggling a `body.panic` CSS class rather than changing `mode`. Details
under **`sudo rm -rf /` panic** below.

## Tab completion and "chips" are the same system

The pill buttons under the input (`.chips`, `renderChips()`) and the
`Tab` key (handled in the keydown listener set up by `mountInput()`)
both resolve suggestions through the same two functions:

- `getArgCandidates(base, remainder)` — given the command typed so far,
  returns the possible next tokens (e.g. `ssh` → known persona hosts,
  `kubectl` → `get pods`/`describe pod ...`, `claude` → its subcommands).
- `candidateDisplayLabel(base, candidate)` — how a candidate should be
  *shown* on a chip, which can differ from the value inserted.

`renderChips()` recomputes on every keystroke (debounced via
`requestAnimationFrame`) and is mode-aware: empty input shows
`defaultChips()` (the quick-command bar), `'ssh'` mode shows the current
persona's topic list plus `exit`, `'top'` mode shows just `q`. Clicking
a chip (`applyChipValue`) either fills in the value and re-opens
suggestions (if there's more to complete) or submits it immediately —
the same logic Tab uses to decide whether to insert a trailing space or
just complete in place.

## Boot sequence / "typed" text plumbing

Anything that appears to type itself out (the boot log, `about`, SSH
persona answers) goes through the same small set of primitives:

- `typeLine(text, cls, speed)` — types one line character-by-character.
- `playSequence(steps)` — runs an array of `{text, delay, typed}` steps
  in order, awaiting each; `typed:true` routes through `typeLine`,
  otherwise the line just appears (`printLine`).
- `sleep(ms)` — the `await`-able delay both of the above build on.

`typeBoot()` (the boot log on first load) and `sudoRmRfPanic()` (the
fake `rm -rf` output) are both just callers of `playSequence`.

## Self-contained sub-features

Each of these is a joke/system that only touches its own bit of state.
This is the canonical explanation for each — the command reference below
just links back here instead of repeating it.

- **SSH persona simulator** — `PERSONAS` (currently just `recruiter`)
  holds a `host` and a `qa()` function returning a list of
  `{cmd, q, a}` FAQ entries. `ssh <host>` → `resolveSSHTarget()` matches
  the typed target against known persona keys/hosts; a match runs
  `sshHandshake()` then `enterPersonaMode()`; no match runs
  `sshFailureSequence()` (a fake connection-refused sequence, escalating
  after repeated failures via `sshFailCount`). Once inside, each `qa()`
  entry's `cmd` is itself a command `runPersonaCommand()` understands.
- **Fake `top`/`kubectl` data** — `topTable()` renders the fake process
  list shown while in `top` mode (see the interval above).
  `kubectlPods()`/`describePod(name)` back `kubectl get pods` /
  `kubectl describe pod <name>` the same way, except these are ordinary
  `shell`-mode commands, not a mode of their own.
- **`sudo rm -rf /` panic** — `isCatastrophicRm(normalized)` decides
  whether a typed `rm` command "counts": it needs both a recursive+force
  flag combination *and* a single dangerous target (`/`, `~`, `/home`,
  `.` — see the function for the exact rules). When it matches,
  `sudoRmRfPanic()` runs the fake-destruction sequence (via
  `playSequence`) and toggles the `body.panic` shake/flicker animation.
- **Game overlay** — `sudo game` / `sudo ./nikita.sh` is the unlock:
  `openGame()`/`closeGame()` show/hide `#gameOverlay` and point its
  iframe at `https://cat.nikita.sh/`, a separate deployed site/game
  whose source isn't part of this repo. *(Not documented in depth here
  — a follow-up.)*
- **Now-playing widget** — `fetchNowPlaying()` polls `/now-playing.json`
  every 20s (`NP_POLL_MS`) and `applyNowPlaying()` writes the result
  into the neofetch card's `Playing` row (including turning it into a
  Spotify link, and a horizontal auto-scroll if the track name overflows
  its box). That JSON file is produced by a *separate* backend — see
  [spotify/SETUP.md](../spotify/SETUP.md) for the writer side; nothing
  currently cross-links the two directions.
- **neofetch card** — `neofetchHTML()` renders the ASCII-art portrait
  (see `CLAUDE.md` for the font-rendering gotchas around its specific
  glyphs) plus the system-info table, including the now-playing row
  above.

## Supported commands

All commands are handled in `runCommand`'s `switch(base)`, inside the
`/* ================= terminal ================= */` section. They fall
into three discoverability tiers — nothing stops you from typing any of
them, but only some are advertised. Entries with more going on link back
to the section above rather than re-explaining it.

### Advertised (shown by `help`, tab/chip-completable via `COMMANDS`)

| Command | What it does |
|---|---|
| `about` | Types out the bio |
| `skills` | Tech stack table |
| `contact` | Social/contact links |
| `cv` | Navigates to `cv.html` |
| `neofetch` | ASCII-art system-info card — see **neofetch card** above |
| `whoami` | A joke "know a bit too much about you" block |
| `ls [-l] [-h] [-a]` | Fake file listing (`renderLs`) |
| `cat <file>` | Prints a "file" — see special filenames below |
| `fortune` | Random one-liner (`fortune()`) |
| `top` | Enters `top` mode — see **Command dispatch** above |
| `kubectl get pods` / `kubectl describe pod <name>` | See **Fake top/kubectl data** above |
| `terraform apply` / `terraform destroy` | Applies optimism, destroys everything (jokes only) |
| `ssh <host>` | Enters `ssh` mode — see **SSH persona simulator** above |
| `claude [prompt]` | Canned AI-assistant responses; `claude log --oneline` and `claude --confess` are their own easter eggs |
| `theme <green\|amber\|cyan>` | Switches the color theme |
| `matrix <on\|off>` | Toggles the background matrix rain |
| `lang <en\|ru>` | Switches output language |
| `help` | Prints this list (bilingual, from `HELP_EN`/`HELP_RU`) |

### Tab-completable but not in `help`

These four are in the `COMMANDS` array (so they show up once you start
typing a matching prefix) but aren't in the printed `help` table:

| Command | What it does |
|---|---|
| `sudo <cmd>` | Mock "permission" message by default — see **`sudo rm -rf /` panic** and **Game overlay** above for its two real triggers |
| `./nikita.sh` | Same as typing `game` directly — "permission denied" unless run via `sudo` (see **Game overlay** above) |
| `clear` | Wipes the terminal output |
| `history` | Lists previously entered commands |

### Fully hidden (real shell command names, no help entry, no completion)

Realistic filler for anyone who pokes around like it's a real terminal —
each just prints a short, mostly-joking fake response and returns to
`shell` mode immediately (no state changes):

`ll`, `echo <text>`, `pwd`, `rm <file>`, `hostname`, `uname [-a]`, `id`,
`df`, `free`, `uptime`, `dmesg`, `who`, `w`, `ps`, `env` / `printenv`,
`alias`, `exit` / `logout` (plays a disconnect sequence, then replays
the boot intro).

### `cat`'s special filenames

`cat` only "finds" a fixed set of names — everything else prints the same
`catNoFile` "No such file or directory" used elsewhere on the site:

- `about.txt` / `skills.txt` / `contact.txt` — same content as the
  `about`/`skills`/`contact` commands, in `cat`-a-file framing
- `cv.html` — a joke ("that's not a text file") rather than opening it
- `nikita.sh` / `./nikita.sh` — prints a fake shell script whose payload
  references `cat.nikita.sh`, foreshadowing the game unlock above

## Everything else

- **History** (`ArrowUp`/`ArrowDown`) — a plain array plus an index,
  reused by both `shell` and `ssh` mode.
- **Input mounting** — `mountInput()` actually removes and recreates the
  input row after each `Enter`, rather than just clearing it.
- **Accessibility labels** — `updateA11yLabels()`, called from
  `updatePromptUI()` and the `lang` command.

These live directly in the `/* ================= input handling
================= */` and `/* ================= terminal
================= */` sections — short enough to read directly rather
than needing more than a pointer here.
