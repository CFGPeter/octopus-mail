# Synology (DS224+) + iPhone + Mac

Goal: mail server in Docker on the NAS, web app on the iPhone, native app on the Mac, all sharing one account set.

## 1. Run the server in Container Manager

Over SSH (or paste `deploy/docker-compose.synology.yml` into *Container Manager → Project*):

```bash
sudo mkdir -p /volume1/docker/octopus-mail && sudo chown 1000:1000 /volume1/docker/octopus-mail
sudo docker compose -f deploy/docker-compose.synology.yml up -d
sudo docker exec octopus-mail octo server pair      # prints a one-time code, valid 15 minutes
```

The image `ghcr.io/cfgpeter/octopus-mail` is built by GitHub Actions for amd64 + arm64: no build on the NAS.
If the package is private, make it public in GitHub (*Packages → Package settings*) or `docker login ghcr.io`.

## 2. HTTPS with the DSM reverse proxy

1. *Control Panel → Login Portal → Advanced → Reverse Proxy → Create*
   - Source: HTTPS, `mail.your-domain.tld`, port 443
   - Destination: HTTP, `localhost`, port 8787
   - Custom Header tab → *Create → WebSocket*  (live new-mail updates)
2. *Control Panel → Security → Certificate*: add a Let's Encrypt certificate for the name and assign it to this proxy rule.
3. Router: forward only TCP 443 to the NAS. **Never forward 8787** (the compose file binds it to localhost on purpose).
4. DSM firewall: allow 443 from your country only; keep *Auto Block* on.

`OCTO_TRUST_PROXY=1` (set in the compose file) makes the server read the real client address from the proxy,
so the "10 failed codes → locked for 10 minutes" rule hits the attacker, not everybody.

## 3. iPhone

Safari → `https://mail.your-domain.tld` → enter the pairing code → Share → *Add to Home Screen*.
It then opens full screen like an app. Each device gets its own key; revoke one with `octo server devices`.

## 4. Mac (Apple Silicon)

Download the DMG from the repository's *Releases* (or the `octopus-mail-macos-arm64` artifact of the *Release* workflow),
drag the app to *Applications*, then once:

```bash
xattr -dr com.apple.quarantine "/Applications/Octopus Mail.app"
```

(The app is ad-hoc signed, not notarized: no paid Apple developer account.)
Open it → *Settings → Home server* → address `https://mail.your-domain.tld` + a new pairing code.

## Security

The login page is on the internet, protected by a one-time code (15 min), per-IP lockout and per-device tokens.
For a stricter setup keep port 443 closed and use Tailscale (Synology package + iPhone app) with the same URL on the tailnet.
Back up `/volume1/docker/octopus-mail` (database, secrets, attachments).
