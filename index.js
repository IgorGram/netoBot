const telegramApi = require('node-telegram-bot-api');
// Импорт dotenv для защиты API токена
require('dotenv').config()

const bot = new telegramApi(process.env.TOKEN, { polling: true})

bot.on('message', (message) => {
	const chatId = message.chat.id;
	
	bot.sendMessage(chatId, 'ответ')
})
