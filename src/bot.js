// src/bot.js — Forge Telegram Bot (grammY)
import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import { createServer } from 'http'
import 'dotenv/config'

const BOT_TOKEN   = process.env.BOT_TOKEN
const APP_URL     = process.env.MINI_APP_URL
const API_URL     = process.env.API_URL
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const PORT        = parseInt(process.env.PORT || '4000')

if (!BOT_TOKEN) throw new Error('BOT_TOKEN missing')
if (!APP_URL)   throw new Error('MINI_APP_URL missing')

const bot = new Bot(BOT_TOKEN)

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Build the WebApp launch button — always full screen, no card
// Telegram Bot API: using web_app type with a button forces full-screen WebApp
function launchButton(text = '⛏ Open Forge', startParam = '') {
  const url = startParam ? `${APP_URL}?startapp=${startParam}` : APP_URL
  return new InlineKeyboard().webApp(text, url)
}

function refUrl(refCode) {
  return `https://t.me/${process.env.BOT_USERNAME || 'ForgeAppBot'}?startapp=ref_${refCode}`
}

// ─── /start ───────────────────────────────────────────────────────────────────
// This is the ONLY entry point for new and returning users.
// start_param carries referral codes like: /start ref_XYZ123
bot.command('start', async (ctx) => {
  const startParam = ctx.match || ''        // e.g. "ref_XYZ123"
  const name = ctx.from?.first_name || 'Miner'

  // If launched from a direct link (not from inside Telegram app)
  // always push straight into the mini app fullscreen
  if (ctx.chat?.type === 'private') {
    const appUrl = startParam
      ? `${APP_URL}?startapp=${encodeURIComponent(startParam)}`
      : APP_URL

    await ctx.reply(
      `⛏ *Welcome to FORGE, ${escMd(name)}*\n\n` +
      `Mine FRG tokens before the next halving locks in higher rates\\.\n\n` +
      `*Early miners earn the most\\.* Every user who joins after the next halving earns half what you earn today\\.\n\n` +
      `Tap below to launch the app\\.`,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: launchButton('⛏ Launch Forge — Full Screen', startParam),
      }
    )
  }
})

// ─── /mine ────────────────────────────────────────────────────────────────────
bot.command('mine', async (ctx) => {
  await ctx.reply(
    `🔄 *Start Mining*\n\nOpen Forge to begin earning FRG\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('⛏ Open Forge — Mine Now') }
  )
})

// ─── /balance ─────────────────────────────────────────────────────────────────
bot.command('balance', async (ctx) => {
  await ctx.reply(
    `💰 *Check Your Balance*\n\nYour live FRG balance is inside the app\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('💰 Open Forge — Check Balance') }
  )
})

// ─── /refer ───────────────────────────────────────────────────────────────────
bot.command('refer', async (ctx) => {
  await ctx.reply(
    `👥 *Referral Program*\n\n` +
    `Invite friends and earn *10% of everything they mine \\- forever*\\.\n\n` +
    `Open Forge to get your personal referral link\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('👥 Open Forge — Refer & Earn') }
  )
})

// ─── /store ───────────────────────────────────────────────────────────────────
bot.command('store', async (ctx) => {
  await ctx.reply(
    `💎 *Forge Store*\n\n` +
    `Unlock Auto\\-Mine, Speed Boosts, and head start FRG packs\\.\n\n` +
    `Pay with TON or Telegram Stars\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('💎 Open Store') }
  )
})

// ─── /upgrade ─────────────────────────────────────────────────────────────────
bot.command('upgrade', async (ctx) => {
  await ctx.reply(
    `⚡ *Mining Upgrades*\n\nBoost your FRG\\/s with Neural Boost, Plasma Array, Dark Matter and more\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('⚡ Open Upgrades') }
  )
})

// ─── /halving ─────────────────────────────────────────────────────────────────
bot.command('halving', async (ctx) => {
  await ctx.reply(
    `📉 *Mining Halving*\n\n` +
    `When user milestones are hit, the mining rate halves for everyone\\.\n\n` +
    `*Your earned FRG is always safe* — only future rates halve\\.\n\n` +
    `Check current epoch and progress inside the app\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('📉 View Halving Status') }
  )
})

// ─── /leaderboard ─────────────────────────────────────────────────────────────
bot.command('leaderboard', async (ctx) => {
  await ctx.reply(
    `🏆 *Leaderboard*\n\nSee the top miners in the Forge network\\.`,
    { parse_mode: 'MarkdownV2', reply_markup: launchButton('🏆 Open Leaderboard') }
  )
})

// ─── /help ────────────────────────────────────────────────────────────────────
bot.command('help', async (ctx) => {
  await ctx.reply(
    `*Forge Commands*\n\n` +
    `/start \\- Launch the app\n` +
    `/mine \\- Start mining FRG\n` +
    `/balance \\- Check your balance\n` +
    `/refer \\- Get your referral link\n` +
    `/store \\- Browse the store\n` +
    `/upgrade \\- Manage upgrades\n` +
    `/halving \\- Check halving status\n` +
    `/leaderboard \\- Top miners\n` +
    `/help \\- This message\n\n` +
    `*Early miners earn the most\\. Start now\\.*`,
    {
      parse_mode: 'MarkdownV2',
      reply_markup: launchButton('⛏ Open Forge'),
    }
  )
})

// ─── Inline query — share Forge with a friend ─────────────────────────────────
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query || ''
  await ctx.answerInlineQuery([
    {
      type: 'article',
      id: 'forge-referral',
      title: '⛏ Invite to Forge — Earn 10% of their mining',
      description: 'Share your referral link and earn forever',
      input_message_content: {
        message_text:
          `⛏ *Join me on FORGE*\n\n` +
          `Mine FRG tokens for free\\. Early miners earn the most before the next halving\\.\n\n` +
          `I earn 10% of everything you mine \\- that incentivises me to help you grow\\.\n\n` +
          `Tap to launch:`,
        parse_mode: 'MarkdownV2',
      },
      reply_markup: launchButton('⛏ Launch Forge', `ref_${query || 'share'}`),
    },
  ], { cache_time: 0 })
})

// ─── Pre-checkout query — approve all Stars payments ─────────────────────────
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
})

// ─── Successful Stars payment ─────────────────────────────────────────────────
bot.on('message:successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment
  const payload = JSON.parse(payment.invoice_payload || '{}')
  const { itemId, userId } = payload

  // Forward to backend API to activate item
  try {
    await fetch(`${API_URL}/api/store/stars-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          from: { id: userId || ctx.from.id },
          successful_payment: payment,
        },
      }),
    })
  } catch (e) {
    console.error('Stars webhook forward error:', e.message)
  }

  await ctx.reply(
    `✅ *Payment Received\\!*\n\n` +
    `*${escMd(itemId || 'Your item')}* is now active on your account\\.\n\n` +
    `Open Forge to see it in action\\.`,
    {
      parse_mode: 'MarkdownV2',
      reply_markup: launchButton('⛏ Open Forge'),
    }
  )
})

// ─── Catch all non-command messages ───────────────────────────────────────────
bot.on('message', async (ctx) => {
  if (ctx.message?.text && !ctx.message.text.startsWith('/')) {
    await ctx.reply(
      `Use the button below to open Forge\\.\n\n_Type /help to see all commands\\._`,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: launchButton('⛏ Open Forge'),
      }
    )
  }
})

// ─── Error handler ────────────────────────────────────────────────────────────
bot.catch((err) => {
  const ctx = err.ctx
  console.error(`Error handling update ${ctx.update.update_id}:`, err.error)
})

// ─── Escape MarkdownV2 ────────────────────────────────────────────────────────
function escMd(text) {
  return String(text || '').replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&')
}

// ─── Set bot commands menu ────────────────────────────────────────────────────
async function setCommands() {
  await bot.api.setMyCommands([
    { command: 'start',       description: '⛏ Launch Forge mining app' },
    { command: 'mine',        description: '🔄 Open mining screen' },
    { command: 'balance',     description: '💰 Check your FRG balance' },
    { command: 'refer',       description: '👥 Get your referral link' },
    { command: 'store',       description: '💎 Browse AutoMine & upgrades' },
    { command: 'upgrade',     description: '⚡ Manage mining upgrades' },
    { command: 'halving',     description: '📉 Current halving status' },
    { command: 'leaderboard', description: '🏆 Top miners' },
    { command: 'help',        description: '❓ All commands' },
  ])
  console.log('✅ Bot commands set')
}

// ─── Set menu button — this is the persistent button in the chat input area ──
// This is what makes Telegram show a persistent "Open App" button
async function setMenuButton() {
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: '⛏ Open Forge',
      web_app: { url: APP_URL },
    },
  })
  console.log('✅ Menu button set to WebApp (fullscreen launch)')
}

// ─── Launch mode ─────────────────────────────────────────────────────────────
const WEBHOOK_MODE = !!process.env.WEBHOOK_DOMAIN

if (WEBHOOK_MODE) {
  // ── Webhook mode (production) ──────────────────────────────────────────────
  const webhookPath = `/webhook/${WEBHOOK_SECRET}`

  const handleUpdate = webhookCallback(bot, 'http')

  const server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === webhookPath) {
      await handleUpdate(req, res)
    } else {
      res.writeHead(200).end('Forge Bot OK')
    }
  })

  server.listen(PORT, async () => {
    const webhookUrl = `${process.env.WEBHOOK_DOMAIN}${webhookPath}`
    await bot.api.setWebhook(webhookUrl, {
      allowed_updates: [
        'message', 'inline_query', 'pre_checkout_query', 'callback_query',
      ],
    })
    console.log(`🚀 Forge Bot running via webhook on port ${PORT}`)
    console.log(`   Webhook: ${webhookUrl}`)
    await setCommands()
    await setMenuButton()
  })
} else {
  // ── Long polling mode (development) ───────────────────────────────────────
  console.log('🔄 Starting Forge Bot in polling mode...')
  await bot.api.deleteWebhook()
  await setCommands()
  await setMenuButton()
  bot.start({
    onStart: () => console.log('✅ Forge Bot polling started'),
    allowed_updates: [
      'message', 'inline_query', 'pre_checkout_query', 'callback_query',
    ],
  })
}
