'use strict'

const express = require('express')
const mineflayer = require('mineflayer')

const app = express()
const port = Number(process.env.PORT || 10000)

const host = process.env.MC_HOST
const minecraftPort = Number(process.env.MC_PORT || 25565)
const username = process.env.MC_USERNAME
const version = process.env.MC_VERSION || '26.2'
const auth = (process.env.MC_AUTH || '').toLowerCase()

let bot = null
let reconnectTimer = null
let shuttingDown = false
let reconnectDelayMs = 15000

app.get('/', (_req, res) => {
  res.status(200).send('GodSMP keeper is running. See /health for status.')
})

app.get('/health', (_req, res) => {
  // Always return HTTP 200 while the web process is alive. UptimeRobot
  // uses this endpoint to send inbound requests often enough for Render's
  // free web-service idle timer; the bot reconnect logic is independent.
  res.status(200).json({
    ok: true,
    botConnected: Boolean(bot && bot.player && bot.entity),
    target: host ? `${host}:${minecraftPort}` : 'not configured'
  })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`HTTP health server listening on ${port}`)
  if (!host || !username) {
    console.error('Missing required environment variables: MC_HOST and MC_USERNAME.')
    console.error('Set them in Render Dashboard > Environment, then redeploy.')
    return
  }
  if (!['offline', 'microsoft'].includes(auth)) {
    console.error('MC_AUTH must be either "offline" or "microsoft".')
    return
  }
  connectBot()
})

function connectBot() {
  if (shuttingDown || reconnectTimer) return

  console.log(`Connecting to ${host}:${minecraftPort} (Minecraft ${version}, auth=${auth})`)
  let currentBot
  try {
    const options = {
      host,
      port: minecraftPort,
      username,
      version,
      auth
    }

    // Microsoft authentication requires a legitimate Java account. Its
    // auth cache is on Render's ephemeral filesystem unless persistent storage
    // is configured, so reauthentication may be needed after a service restart.
    if (auth === 'microsoft') {
      options.profilesFolder = './profiles'
    }

    currentBot = mineflayer.createBot(options)
    bot = currentBot
  } catch (error) {
    console.error('Could not create bot:', error.message || error)
    scheduleReconnect()
    return
  }

  currentBot.once('login', () => {
    reconnectDelayMs = 15000
    console.log('Bot logged in; waiting for world spawn.')
  })

  currentBot.once('spawn', () => {
    reconnectDelayMs = 15000
    console.log('Bot spawned successfully and is online.')
  })

  currentBot.on('kicked', (reason) => {
    console.log('Bot was kicked:', safeString(reason))
  })

  currentBot.on('error', (error) => {
    console.error('Minecraft bot error:', error.message || error)
  })

  currentBot.once('end', (reason) => {
    console.log('Bot connection ended:', reason || 'no reason supplied')
    if (bot === currentBot) bot = null
    scheduleReconnect()
  })
}

function scheduleReconnect() {
  if (shuttingDown || reconnectTimer) return
  const delay = reconnectDelayMs
  reconnectDelayMs = Math.min(Math.round(reconnectDelayMs * 1.5), 120000)
  console.log(`Reconnecting in ${Math.round(delay / 1000)} seconds.`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connectBot()
  }, delay)
}

function safeString(value) {
  if (typeof value === 'string') return value
  try { return JSON.stringify(value) } catch { return String(value) }
}

function shutdown() {
  shuttingDown = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (bot) {
    try { bot.quit('Keeper service shutting down') } catch {}
  }
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
