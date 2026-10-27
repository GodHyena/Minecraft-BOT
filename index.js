const mineflayer = require('mineflayer');

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: 'your-server-ip',
    port: 25565, // ✅ Replace with actual port number
    username: 'aurora_assistant',
    version: '1.21.4'
  });

  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();

    if (msg.includes('/register')) {
      bot.chat('/register Bot@12345 Bot@12345');
    } else if (msg.includes('/login')) {
      bot.chat('/login Bot@12345');
    }

    if (
      msg.includes('teleport to you') ||
      msg.includes('teleport to them')
    ) {
      console.log('Teleport request detected! Accepting...');
      bot.chat('/tpaccept');
    }
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    const lower = message.toLowerCase();

    if (lower.startsWith('!')) {
      const args = lower.slice(1).split(' ');
      const command = args.shift();

      switch (command) {
        case 'help':
          bot.chat(`Hi ${username}, I respond to hello, how are you, and commands like !help, !ping.`);
          break;
        case 'sunilgaming':
          bot.chat(`Hey ${username}, sunilgaming created me!`);
          break;
        case 'ping':
          bot.chat(`Pong, ${username}!`);
          break;
        default:
          bot.chat(`Unknown command: ${command}`);
      }
    } else {
      if (lower.includes('hello')) bot.chat(`Hi ${username}!`);
      else if (lower.includes('how are you')) bot.chat(`I'm just a bot, but thanks for asking!`);
    }
  });

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return;
    console.log(`[Whisper] <${username}>: ${message}`);
    bot.whisper(username, `Hello ${username}, I got your message!`);
  });

  function randomMovement() {
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[Math.floor(Math.random() * directions.length)];

    bot.setControlState(dir, true);
    setTimeout(() => {
      bot.setControlState(dir, false);
      setTimeout(randomMovement, 2000);
    }, 3000);
  }

  bot.once('spawn', () => {
    setTimeout(() => {
      bot.chat('AFK bot online!');
      randomMovement();
    }, 1000);
  });

  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting in 5 seconds...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => {
    console.log('Bot error:', err);
  });

  bot.on('kicked', reason => {
    console.log('Bot was kicked:', reason);
  });
}

createBot();
