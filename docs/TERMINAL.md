# index.html — the interactive terminal

The homepage isn't a normal portfolio page — it's a terminal you type
into. Nothing you type touches a real computer or server; it's all for
show, in the spirit of a playful DevOps in-joke. This is a tour of what's
there to find.

## Getting around

- Type `help` to see a starter list of commands.
- As you type, suggestions appear below the input — click one to fill it
  in, or keep typing your own.
- The up/down arrow keys cycle through what you've typed before, like a
  real shell.

## Learn about Nikita

| Type this | To see |
|---|---|
| `about` | A short bio |
| `skills` | Tech stack |
| `contact` | Ways to get in touch |
| `cv` | Opens the résumé page |
| `whoami` | A joke "we know a bit too much about you" block |
| `neofetch` | A system-info-styled summary card — including what's currently playing on Spotify |

## A fake sysadmin toolbox

A long list of real Linux commands are recreated purely for flavor —
type any of them and you'll get a joke response, never anything real:
`ls`, `cat <file>`, `pwd`, `id`, `df`, `free`, `uptime`, `uname`,
`hostname`, `ps`, `who`, `w`, `env`, `history`, `alias`, `echo`, `rm`,
and a few more. A couple of highlights: `df` lists a filesystem that's
100% full of condensed milk, and `ps` lists a process called
`on_call_anxiety`. `cat about.txt` / `skills.txt` / `contact.txt` show
the same info as the commands above, "file" flavored.

## The bigger easter eggs

- **`top`** — drops you into a live, constantly-updating (fake) process
  monitor. Press `q` or type `exit` to get back out.
- **`vim`** (or `vi`) — try it. Getting out is the real challenge — and
  no, Ctrl+C won't save you here.
- **`kubectl get pods`** / **`kubectl describe pod <name>`** — peek at a
  pretend Kubernetes cluster.
- **`terraform apply`** / **`terraform destroy`** — a one-line joke
  either way.
- **`ssh recruiter@nikita.sh`** — "connects" you to a chatty persona you
  can actually ask questions, each with a canned answer.
- **`claude <prompt>`** — a mock AI assistant that gives self-aware,
  canned answers. Also try `claude log --oneline` and `claude --confess`.
- **`sudo rm -rf /`** — go ahead and try it. (Nothing is harmed — it's a
  static site, not a real machine.)
- **`sudo ./milk-quest.sh`** — unlocks a hidden little browser game
  (`cat.nikita.sh`), styled up in a retro CRT-monitor window. There's
  also a shortcut once you've found it in `.bashrc`: plain `game`.

## Look and feel

- `theme green` / `amber` / `cyan` changes the color scheme.
- There's a 4th, hidden theme — not listed in `theme`'s usage or
  tab-completion. Ask `claude "add light theme"` multiple times to unlock 
  it, or guess its name directly with `theme sabbatical`.
- `matrix on` / `off` toggles the background "digital rain" effect.
- `lang en` / `ru` switches the whole site's language — same toggle as
  the language chip in the corner.
- A short animated boot sequence plays the first time the page loads.
