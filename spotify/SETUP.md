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

`nikita.sh`'s `/` location is a reverse proxy to your Yandex Cloud origin —
there's no local docroot for the apex domain, so nginx won't automatically
pick up a file dropped in `/var/www/nikita.sh`. Add one `location` block
that serves *just* that one file locally, and make sure it comes **before**
the catch-all `location /` proxy block (nginx matches the most specific
location first regardless of order, but keeping it above is clearer to read).

Create the directory first:
```bash
sudo mkdir -p /var/www/nikita.sh
```

Then edit `/etc/nginx/sites-available/nikita.sh` and add this inside the
`nikita.sh` (port 443) server block, alongside the existing `location /`:

```nginx
# nikita.sh -> Yandex origin
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name nikita.sh;
    ssl_certificate     /etc/letsencrypt/live/nikita.sh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nikita.sh/privkey.pem;

    location = /now-playing.json {
        alias /var/www/nikita.sh/now-playing.json;
        add_header Cache-Control "no-store";
        default_type application/json;
    }

    location / {
        proxy_pass http://<redacted-yandex-website-endpoint>;
        proxy_set_header Host <redacted-yandex-website-endpoint>;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`location = /now-playing.json` is an exact match, so it takes priority over
the prefix-matched `location /` — requests for that one path get served
from disk, everything else still proxies to Yandex as before.

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

## 6. Add the widget to your site
Copy the markup/CSS/JS from `now-playing-widget.html` into your page.
Adjust `ENDPOINT` in the script if the JSON file isn't at the site root.

## Useful commands
```bash
sudo systemctl status spotify-widget.timer   # check it's scheduled
sudo systemctl list-timers spotify-widget    # see next run time
journalctl -u spotify-widget.service -f      # tail logs / debug errors
```
