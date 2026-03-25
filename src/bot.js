// src/bot.js — Forge Telegram Bot
// Deploy on Render as BACKGROUND WORKER (not Web Service) — no port needed
import { Bot, InlineKeyboard } from 'grammy'
import 'dotenv/config'

// ─── Config — hardcoded so nothing can go wrong ───────────────────────────────
const BOT_TOKEN  = process.env.BOT_TOKEN  || '8629852173:AAEYP-nf_XZYCs7oKKm-gFayUqZIiIBA2KM'
const BOT_NAME   = 'Forgeminebot'
const APP_URL    = process.env.MINI_APP_URL || 'https://YOUR_FRONTEND_URL_HERE.com'
const API_URL    = process.env.API_URL      || ''

const bot = new Bot(BOT_TOKEN)

// ─── Launch button — opens Mini App fullscreen ────────────────────────────────
// InlineKeyboard.webApp() is the ONLY way to guarantee fullscreen.
// The user taps it → Telegram opens the Mini App in fullscreen automatically.
// No card. No "Open" prompt. Direct fullscreen.
function launchBtn(text = '⛏ Open Forge', startParam = '') {
  const url = startParam
    ? `${APP_URL}?startapp=${encodeURIComponent(startParam)}`
    : APP_URL
  return new InlineKeyboard().webApp(text, url)
}

// ─── /start ───────────────────────────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const param = ctx.match || ''
  const name  = ctx.from?.first_name || 'Miner'
  await ctx.reply(
    `⛏ Welcome to FORGE, ${name}!\n\n` +
    `Mine FRG tokens before the next halving cuts the rate in half.\n\n` +
    `Early miners always earn the most.\n\nTap below to launch:`,
    { reply_markup: launchBtn('⛏ Launch Forge', param) }
  )
})

// ─── /mine ────────────────────────────────────────────────────────────────────
bot.command('mine', async (ctx) => {
  await ctx.reply(
    `Start earning FRG — open Forge and tap Mine.`,
    { reply_markup: launchBtn('⛏ Mine Now') }
  )
})

// ─── /balance ─────────────────────────────────────────────────────────────────
bot.command('balance', async (ctx) => {
  await ctx.reply(
    `Check your live FRG balance inside Forge.`,
    { reply_markup: launchBtn('💰 Check Balance') }
  )
})

// ─── /refer ───────────────────────────────────────────────────────────────────
bot.command('refer', async (ctx) => {
  await ctx.reply(
    `Invite friends and earn 10% of everything they mine — forever.\n\nGet your referral link inside Forge.`,
    { reply_markup: launchBtn('👥 Refer & Earn') }
  )
})

// ─── /store ───────────────────────────────────────────────────────────────────
bot.command('store', async (ctx) => {
  await ctx.reply(
    `Unlock Auto-Mine, Speed Boosts, and FRG head-start packs.\n\nPay with TON or Telegram Stars.`,
    { reply_markup: launchBtn('💎 Open Store') }
  )
})

// ─── /upgrade ─────────────────────────────────────────────────────────────────
bot.command('upgrade', async (ctx) => {
  await ctx.reply(
    `Boost your FRG/s with Neural Boost, Plasma Array, Dark Matter and more.`,
    { reply_markup: launchBtn('⚡ Manage Upgrades') }
  )
})

// ─── /halving ─────────────────────────────────────────────────────────────────
bot.command('halving', async (ctx) => {
  await ctx.reply(
    `When user milestones hit, the mining rate halves for everyone.\n\nYour earned FRG is always safe — only future rates halve.\n\nCheck your current epoch inside Forge.`,
    { reply_markup: launchBtn('📉 Halving Status') }
  )
})

// ─── /leaderboard ─────────────────────────────────────────────────────────────
bot.command('leaderboard', async (ctx) => {
  await ctx.reply(
    `See the top miners in the Forge network.`,
    { reply_markup: launchBtn('🏆 Leaderboard') }
  )
})

// ─── /help ────────────────────────────────────────────────────────────────────
bot.command('help', async (ctx) => {
  await ctx.reply(
    `Forge Commands:\n\n` +
    `/start — Launch the app\n` +
    `/mine — Open mining\n` +
    `/balance — Your FRG balance\n` +
    `/refer — Referral link\n` +
    `/store — Store & purchases\n` +
    `/upgrade — Mining upgrades\n` +
    `/halving — Halving status\n` +
    `/leaderboard — Top miners\n` +
    `/help — This message\n\n` +
    `Early miners earn the most. Start now.`,
    { reply_markup: launchBtn('⛏ Open Forge') }
  )
})

// ─── Inline query — share from any chat ───────────────────────────────────────
bot.on('inline_query', async (ctx) => {
  await ctx.answerInlineQuery([
    {
      type: 'article',
      id: 'forge-invite',
      title: '⛏ Invite to Forge — earn 10% of their mining',
      description: 'Share your referral and earn forever',
      input_message_content: {
        message_text:
          `⛏ Join me on FORGE\n\n` +
          `Mine FRG tokens for free. Early miners earn the most.\n\n` +
          `Tap to launch:`,
      },
      reply_markup: launchBtn('⛏ Launch Forge'),
    },
  ], { cache_time: 0 })
})

// ─── Stars payment — pre-approve ─────────────────────────────────────────────
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
})

// ─── Stars payment — successful ───────────────────────────────────────────────
bot.on('message:successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment
  let itemId = 'item'
  try { itemId = JSON.parse(payment.invoice_payload || '{}').itemId || 'item' } catch {}

  // Forward to backend if API_URL is set
  if (API_URL) {
    fetch(`${API_URL}/api/store/stars-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: { from: { id: ctx.from.id }, successful_payment: payment }
      }),
    }).catch(e => console.error('Stars relay error:', e.message))
  }

  await ctx.reply(
    `Payment received! ${itemId} is now active on your account.`,
    { reply_markup: launchBtn('⛏ Open Forge') }
  )
})

// ─── Any other message → show launch button ───────────────────────────────────
bot.on('message', async (ctx) => {
  if (ctx.message?.text && !ctx.message.text.startsWith('/')) {
    await ctx.reply(
      `Tap below to open Forge. Type /help for all commands.`,
      { reply_markup: launchBtn('⛏ Open Forge') }
    )
  }
})

// ─── Global error handler ─────────────────────────────────────────────────────
bot.catch((err) => {
  console.error('Bot error on update', err.ctx?.update?.update_id, ':', err.error?.message || err.error)
})

// ─── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  // Delete any stale webhook — polling mode doesn't need one
  await bot.api.deleteWebhook({ drop_pending_updates: true })

  // Commands menu in Telegram
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

  // Menu button — persistent button in every chat that opens the app fullscreen
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: '⛏ Open Forge',
      web_app: { url: APP_URL },
    },
  })
  console.log('✅ Menu button → WebApp fullscreen')

  // Long polling — no port, no HTTP server, works on Render Background Worker
  await bot.start({
    onStart: (info) => console.log(`✅ @${info.username} is running (polling)`),
    allowed_updates: ['message', 'inline_query', 'pre_checkout_query'],
  })
}

start().catch(err => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
