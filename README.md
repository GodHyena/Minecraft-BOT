# GodSMP Keeper Bot (Minecraft Java 26.2)

This project runs a Mineflayer-based Java bot and a tiny HTTP endpoint for Render. It retries the Minecraft connection after disconnects.

## Important compatibility and login notes

- The dependency is an **unofficial third-party Mineflayer distribution** for Minecraft Java 26.2, not the official upstream Mineflayer release. Review the repository before deploying: https://github.com/Complexity-ML/mineflayer-26.2
- Use `MC_AUTH=microsoft` only with a legitimate Minecraft Java account. Render's free filesystem is ephemeral, so an unexpected restart can require Microsoft reauthentication.
- `MC_AUTH=offline` works only when the target server explicitly permits offline-mode username connections. Do not disable authentication on a public server just to make a bot work. On a Velocity network, connect to the public player address and authenticate as the network requires.
- `MC_HOST` and `MC_PORT` must be the actual Java join address/port (or the public Velocity address/port if players join through Velocity), not the control-panel URL.

## Render settings

Create a **Web Service** from this repository:

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Instance type: Free

Set these environment variables in Render's service settings:

- `MC_HOST`: the server's Java join hostname/IP
- `MC_PORT`: the Java join port from the panel
- `MC_USERNAME`: for offline auth, the chosen bot name; for Microsoft auth, the account email
- `MC_AUTH`: `offline` or `microsoft`
- `MC_VERSION`: `26.2`

Deploy and check Logs. `Bot spawned successfully and is online.` means the bot joined. The web endpoint is `https://YOUR-SERVICE.onrender.com/health`.

## UptimeRobot

Create an HTTP(s) monitor for `https://YOUR-SERVICE.onrender.com/health`, using UptimeRobot's free 5-minute monitoring interval. This supplies inbound HTTP requests to Render. The bot code separately handles Minecraft disconnects.

## Caveats

- Render free services can restart at any time and use an ephemeral filesystem. This is not a guaranteed 24/7 service. A single continuously running free web service uses about 720–744 of the 750 monthly free instance-hours; other free services in the same workspace use the same allowance.
- If the Minecraft server has idle-kick rules or needs manual wake-up, configure those through the host's permitted procedure. A reconnecting bot cannot guarantee that a stopped server will start automatically.
