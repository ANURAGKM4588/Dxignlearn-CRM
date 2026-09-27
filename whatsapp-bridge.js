/**
 * DXIGN - 100% FREE WHATSAPP WEB SMART AUTO-REPLY & 24H FOLLOW-UP BOT
 * 
 * Connected WhatsApp Number: +91 7356413558
 * Uses @whiskeysockets/baileys (open-source WhatsApp Web protocol).
 * 
 * HOW IT WORKS:
 * 1. Reads incoming customer inquiries.
 * 2. Understands which service they want (e.g. AI Video Creation, Web Dev, Ads).
 * 3. Sends the exact tailored reply and pricing.
 * 4. Arms a 24-hour timer: If the client does not reply within 24 hours,
 *    it sends a follow-up specifically asking about that service quote!
 * 
 * Setup instructions:
 * 1. Run in terminal:
 *    npm init -y
 *    npm install @whiskeysockets/baileys qrcode-terminal
 * 2. Run:
 *    node whatsapp-bridge.js
 * 3. Scan QR code on your phone (+91 7356413558):
 *    (WhatsApp > Settings > Linked Devices > Link a Device)
 */

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';

export const CONNECTED_PHONE = '+917356413558';

// Knowledge Base of Services
const SERVICES = [
  {
    name: 'AI Video Creation',
    keywords: ['video', 'ai video', 'reels', 'shorts', 'വീഡിയോ', 'animation', 'avatar'],
    reply: 'Hi! 👋 Thank you for inquiring about our AI Video Creation service. We create ultra-realistic high-converting AI videos, ads, and spokesperson reels. Our pricing starts from ₹4,500 per video (includes scriptwriting, AI voiceover, visuals, and editing). Would you like to see a sample video?',
    followup: "Hi sir, hope you're doing well! Just following up regarding the AI Video Creation pricing we shared. Is the price okay for your budget? Let us know if you'd like to proceed or if you have any questions!"
  },
  {
    name: 'Website Development',
    keywords: ['website', 'web', 'app', 'സൈറ്റ്', 'developer', 'development'],
    reply: 'Hello! 👋 For Website Development, we build modern, responsive, fast-loading business websites and landing pages. Basic business sites start at ₹15,000, and full custom web apps at ₹35,000+. What type of website are you looking to build?',
    followup: 'Hi sir, checking in regarding your website inquiry! Did you have a chance to think over the project details? We have an open development slot this week if you would like to get started.'
  },
  {
    name: 'Social Media Ads & Marketing',
    keywords: ['ad', 'ads', 'marketing', 'instagram', 'facebook', 'leads', 'മാർക്കറ്റിംഗ്'],
    reply: 'Hi there! 👋 For Social Media Ads & Lead Generation, we manage your Meta ad campaigns, create high-converting creatives, and optimize for leads. Our monthly management is ₹12,000/month. What business or product are you advertising?',
    followup: 'Hello! Just following up regarding your ad campaign inquiry. Are you ready to start running ads for your business, or would you like to discuss the strategy first?'
  },
  {
    name: 'Branding & Logo Design',
    keywords: ['logo', 'brand', 'branding', 'ലോഗോ', 'poster', 'graphic'],
    reply: 'Hi! ✨ For Branding & Logo Design, we craft premium brand identities, logos, and color palettes. Packages range from ₹5,000 to ₹12,000. Do you already have a brand name in mind?',
    followup: "Hi sir! Checking in on your logo/branding project. Did you review our portfolio? Would love to know if you'd like to proceed!"
  }
];

// Active conversations with 24h follow-up timers
const conversationTimers = new Map();

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n======================================================');
      console.log('⚡ DXIGN: SCAN THIS QR CODE WITH YOUR PHONE (+91 7356413558)');
      console.log('   (Open WhatsApp > Settings > Linked Devices > Link a Device)');
      console.log('======================================================\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('✅ DXIGN WhatsApp Auto-Reply & 24h Follow-up Bot is ONLINE!');
      console.log('Connected phone: +91 7356413558');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.key.fromMe && m.type === 'notify') {
      const senderJid = msg.key.remoteJid;
      const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();

      console.log(`\n[Incoming Message from ${senderJid}]: "${text}"`);

      // If client replied, cancel any pending 24h follow-up
      if (conversationTimers.has(senderJid)) {
        console.log(`[Client Replied]: Clearing pending 24h follow-up for ${senderJid}`);
        clearTimeout(conversationTimers.get(senderJid).timer);
        conversationTimers.delete(senderJid);
      }

      // Analyze message to match exact service
      const textLower = text.toLowerCase();
      let matchedService = SERVICES[0]; // Default
      for (const srv of SERVICES) {
        if (srv.keywords.some(kw => textLower.includes(kw))) {
          matchedService = srv;
          break;
        }
      }

      console.log(`[Service Matched]: ${matchedService.name}`);
      console.log(`[Sending Service Reply]: "${matchedService.reply.slice(0, 60)}..."`);

      // 1. Send immediate service details & pricing
      await sock.sendMessage(senderJid, { text: matchedService.reply });

      // 2. Arm 24-hour follow-up timer (24 hours = 86,400,000 ms)
      const followUpDelay = 24 * 60 * 60 * 1000;
      console.log(`[24h Follow-up Timer Armed]: Will trigger in 24 hours if client doesn't reply.`);

      const timer = setTimeout(async () => {
        try {
          console.log(`\n[24 Hours Elapsed]: No reply from ${senderJid}. Sending context follow-up...`);
          await sock.sendMessage(senderJid, { text: matchedService.followup });
          console.log(`[24h Context Follow-up Sent]: "${matchedService.followup}"`);
        } catch (err) {
          console.error('Failed to send 24h follow-up:', err);
        } finally {
          conversationTimers.delete(senderJid);
        }
      }, followUpDelay);

      conversationTimers.set(senderJid, {
        service: matchedService.name,
        timer
      });
    }
  });
}

connectToWhatsApp();
