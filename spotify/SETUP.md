# Spotify Now-Playing Widget — VPS Setup

## 1. Create a Spotify app
- Go to https://developer.spotify.com/dashboard → Create app
- Add Redirect URI: `http://127.0.0.1:8888/callback`
- Copy the **Client ID** and **Client Secret**

## 2. Get a refresh token (run once, on any machine with a browser)
```bash
export SPOTIFY_CLIENT_ID=xxxx
export SPOTIFY_CLIENT_SECRET=xxxx
python3 get_refresh_token.py
```
Open the printed URL, approve access, copy the refresh token that gets printed.

## 3. Copy files to the VPS
```bash
sudo mkdir -p /opt/spotify-widget
sudo cp spotify_now_playing.py /opt/spotify-widget/

sudo cp spotify-widget.env /etc/spotify-widget.env
sudo nano /etc/spotify-widget.env   # fill in client id/secret/refresh token, and OUTPUT_PATH
sudo chmod 600 /etc/spotify-widget.env
sudo chown root:root /etc/spotify-widget.env

sudo cp spotify-widget.service /etc/systemd/system/
sudo cp spotify-widget.timer /etc/systemd/system/
```

**Note:** the service file uses `DynamicUser=yes` for sandboxing, which means
systemd creates a temporary unprivileged user to run the script. Make sure
`ReadWritePaths` in `spotify-widget.service` points at the actual directory
containing your `OUTPUT_PATH`, and that directory is writable by that dynamic
user (systemd handles the permissions automatically via `ReadWritePaths`).

## 4. Enable and start the timer
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now spotify-widget.timer

# sanity check it ran
sudo systemctl start spotify-widget.service
cat /var/www/nikita.sh/now-playing.json
```

## 5. Add a location block to nginx to serve the JSON file

If `/` on your domain is a reverse proxy (no local docroot for the apex
domain), nginx won't automatically pick up a file dropped in
`/var/www/nikita.sh`. Add one `location` block that serves *just* that
one file locally, above your existing `location /` proxy block (nginx
matches the most specific location regardless of order, but keeping it
above is clearer to read).

Create the directory first:
```bash
sudo mkdir -p /var/www/nikita.sh
```

Then add this inside your existing HTTPS server block for the domain,
alongside your existing `location /`:

```nginx
location = /now-playing.json {
    alias /var/www/nikita.sh/now-playing.json;
    add_header Cache-Control "no-store";
    default_type application/json;
}
```

`location = /now-playing.json` is an exact match, so it takes priority
over a prefix-matched `location /` — requests for that one path get
served from disk, everything else keeps proxying to your existing
backend, untouched.

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

Then verify:
```bash
curl https://nikita.sh/now-playing.json
```

**Permissions note:** the script writes the file with default permissions
(readable by everyone, `644`), and nginx just needs read access to
`/var/www/nikita.sh/now-playing.json` and execute access on the directory —
no special ownership needed since `DynamicUser` writes it as world-readable
by default. If you get a `403` from nginx, check `ls -l /var/www/nikita.sh/`
and `chmod o+rx /var/www/nikita.sh` if needed.

## 6. Frontend integration

nikita.sh's own frontend already polls `/now-playing.json` and renders it
inside the terminal's neofetch card (see `fetchNowPlaying()` in
`index.html`) — once steps 1–5 are done, it picks the widget up
automatically, nothing else to wire up here.

`now-playing-widget.html` in this folder is a separate, generic reference
implementation (its own markup/CSS/JS, not tied to nikita.sh's theme) —
useful only if you want to reuse this backend behind a different
frontend. Adjust `ENDPOINT` in its script if the JSON file isn't served
at that frontend's site root.

## Useful commands
```bash
sudo systemctl status spotify-widget.timer   # check it's scheduled
sudo systemctl list-timers spotify-widget    # see next run time
journalctl -u spotify-widget.service -f      # tail logs / debug errors
```
