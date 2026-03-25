// src/bot.js — Forge Telegram Bot
// Web Service on Render free tier — HTTP server keeps it alive, polling runs alongside.

import { Bot, InlineKeyboard } from 'grammy'
import { createServer } from 'http'
import 'dotenv/config'

// ─── Config ───────────────────────────────────────────────────────────────────
const BOT_TOKEN  = process.env.BOT_TOKEN   || '8629852173:AAEYP-nf_XZYCs7oKKm-gFayUqZIiIBA2KM'
const BOT_NAME   = process.env.BOT_USERNAME || 'Forgeminebot'
const APP_URL    = process.env.MINI_APP_URL || 'https://glowing-sundae-ed61bd.netlify.app'
const API_URL    = process.env.API_URL      || ''
const PORT       = parseInt(process.env.PORT || '3000')

const bot = new Bot(BOT_TOKEN)

// ─── Tiny HTTP server — satisfies Render's port requirement ───────────────────
createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Forge Bot OK')
}).listen(PORT, () => console.log(`Health check on port ${PORT}`))

// ─── FULLSCREEN LAUNCH ────────────────────────────────────────────────────────
// There are TWO ways to open a Mini App button in Telegram:
//
//   1. InlineKeyboard.webApp(text, url)
//      → Opens the URL as a Mini App BUT respects the user's Telegram version.
//        On older Telegram it shows as a card. On newer it honours BotFather mode.
//
//   2. Direct t.me link as a regular URL button
//      → t.me/BotName/appshortname  — this is the GUARANTEED fullscreen path.
//        Telegram ALWAYS opens t.me deep links in fullscreen Mini App mode.
//        This is what Notcoin, Hamster Kombat etc. all use.
//
// We use BOTH: webApp() button + a t.me deep link button below it.
// The webApp() button is picked up by new Telegram.
// The t.me link is the fallback that always works.

function launchBtn(text = 'Open Forge', startParam = '') {
  const tmeUrl = startParam
    ? `https://t.me/${BOT_NAME}?startapp=${encodeURIComponent(startParam)}`
    : `https://t.me/${BOT_NAME}`

  // webApp button — fullscreen on Telegram 8.0+
  return new InlineKeyboard()
    .webApp(text, APP_URL)
}

// t.me deep link — always opens fullscreen regardless of Telegram version
function deepLinkBtn(text = '⛏ Open Forge (tap if above doesn\'t work)', startParam = '') {
  const tmeUrl = startParam
    ? `https://t.me/${BOT_NAME}?startapp=${encodeURIComponent(startParam)}`
    : `https://t.me/${BOT_NAME}`
  return new InlineKeyboard().url(text, tmeUrl)
}

// ─── /start ───────────────────────────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const param = ctx.match || ''
  const name  = ctx.from?.first_name || 'Miner'
  await ctx.reply(
    `⛏ Welcome to FORGE, ${name}!\n\n` +
    `Mine FRG tokens before the next halving cuts the rate in half.\n\n` +
    `Early miners always earn the most.\n\nTap below to launch:`,
    {
      reply_markup: new InlineKeyboard()
        .webApp('⛏ Launch Forge', APP_URL)
        .row()
        .url('🔗 Open via Telegram link', `https://t.me/${BOT_NAME}?startapp=${param || 'start'}`)
    }
  )
})

// ─── All other commands — same double-button pattern ─────────────────────────
bot.command('mine', async (ctx) => {
  await ctx.reply(`Start earning FRG — open Forge and tap Mine.`, {
    reply_markup: new InlineKeyboard()
      .webApp('⛏ Mine Now', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('balance', async (ctx) => {
  await ctx.reply(`Check your live FRG balance inside Forge.`, {
    reply_markup: new InlineKeyboard()
      .webApp('💰 Check Balance', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('refer', async (ctx) => {
  await ctx.reply(
    `Invite friends and earn 10% of everything they mine — forever.\n\nGet your referral link inside Forge.`, {
    reply_markup: new InlineKeyboard()
      .webApp('👥 Refer & Earn', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('store', async (ctx) => {
  await ctx.reply(`Unlock Auto-Mine, Speed Boosts, and FRG packs. Pay with TON or Stars.`, {
    reply_markup: new InlineKeyboard()
      .webApp('💎 Open Store', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('upgrade', async (ctx) => {
  await ctx.reply(`Boost your FRG/s with Neural Boost, Plasma Array, Dark Matter and more.`, {
    reply_markup: new InlineKeyboard()
      .webApp('⚡ Manage Upgrades', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('halving', async (ctx) => {
  await ctx.reply(
    `When user milestones hit, the mining rate halves.\n\nYour earned FRG is always safe — only future rates halve.`, {
    reply_markup: new InlineKeyboard()
      .webApp('📉 Halving Status', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('leaderboard', async (ctx) => {
  await ctx.reply(`See the top miners in the Forge network.`, {
    reply_markup: new InlineKeyboard()
      .webApp('🏆 Leaderboard', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

bot.command('help', async (ctx) => {
  await ctx.reply(
    `Forge Commands:\n\n/start — Launch\n/mine — Mining\n/balance — Balance\n/refer — Referrals\n/store — Store\n/upgrade — Upgrades\n/halving — Halving\n/leaderboard — Top miners\n/help — This`, {
    reply_markup: new InlineKeyboard()
      .webApp('⛏ Open Forge', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
  })
})

// ─── Inline query ─────────────────────────────────────────────────────────────
bot.on('inline_query', async (ctx) => {
  await ctx.answerInlineQuery([{
    type: 'article',
    id: 'forge-invite',
    title: '⛏ Invite to Forge — earn 10% of their mining',
    description: 'Share your referral and earn forever',
    input_message_content: {
      message_text: `⛏ Join me on FORGE\n\nMine FRG for free. Early miners earn the most.\n\nTap to launch:`,
    },
    reply_markup: new InlineKeyboard()
      .webApp('⛏ Launch Forge', APP_URL)
      .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`),
  }], { cache_time: 0 })
})

// ─── Stars ────────────────────────────────────────────────────────────────────
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
})

bot.on('message:successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment
  let itemId = 'item'
  try { itemId = JSON.parse(payment.invoice_payload || '{}').itemId || 'item' } catch {}
  if (API_URL) {
    fetch(`${API_URL}/api/store/stars-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { from: { id: ctx.from.id }, successful_payment: payment } }),
    }).catch(e => console.error('Stars relay error:', e.message))
  }
  await ctx.reply(`Payment received! ${itemId} is now active.`, {
    reply_markup: new InlineKeyboard().webApp('⛏ Open Forge', APP_URL)
  })
})

// ─── Any other message ────────────────────────────────────────────────────────
bot.on('message', async (ctx) => {
  if (ctx.message?.text && !ctx.message.text.startsWith('/')) {
    await ctx.reply(`Tap below to open Forge. Type /help for all commands.`, {
      reply_markup: new InlineKeyboard()
        .webApp('⛏ Open Forge', APP_URL)
        .row().url('🔗 Open via link', `https://t.me/${BOT_NAME}`)
    })
  }
})

bot.catch((err) => console.error('Bot error:', err.error?.message || err.error))

// ─── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  await bot.api.deleteWebhook({ drop_pending_updates: true })

  await bot.api.setMyCommands([
    { command: 'start',       description: '⛏ Launch Forge mining app' },
    { command: 'mine',        description: '🔄 Start mining FRG' },
    { command: 'balance',     description: '💰 Check your FRG balance' },
    { command: 'refer',       description: '👥 Get referral link' },
    { command: 'store',       description: '💎 AutoMine & upgrades' },
    { command: 'upgrade',     description: '⚡ Mining upgrades' },
    { command: 'halving',     description: '📉 Current halving status' },
    { command: 'leaderboard', description: '🏆 Top miners' },
    { command: 'help',        description: '❓ All commands' },
  ])
  console.log('✅ Commands set')

  // Menu button — persistent button at bottom of every chat
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: '⛏ Open Forge',
      web_app: { url: APP_URL },
    },
  })
  console.log('✅ Menu button set')

  bot.start({
    onStart: (info) => console.log(`✅ @${info.username} polling started`),
    allowed_updates: ['message', 'inline_query', 'pre_checkout_query'],
  })
}

start().catch(err => { console.error('Fatal:', err); process.exit(1) })
