const telegramApi = require('node-telegram-bot-api');
const axios = require('axios');
const qs = require('qs');
require('dotenv').config()


const getSubjectFromRevision = async () => {
	const response = await axios.get('https://netology.ru/backend/api/expert/homeworks', {
		params: {
			q: {
				lesson_task_task_type_eq: 1,
				status_eq: 0
			},
		},
		paramsSerializer: {
			serialize: (params) => qs.stringify(params, {arrayFormat: 'brackets'})
		},
		headers: {
			Cookie: process.env.COOKIE
		}
	});
	return response.data.homeworks
		.filter(data => data.reviewer?.id === +process.env.USER_ID)
		.reduce((acc, {task, user, program}) => {
		return `${acc} \n <b>${task.title}</b>
		<i>${program.pretty_urlcode}</i>
		${user.full_name} \n`
	}, '')
};

const getNewSubjectForCheck = async () => {
	const response = await axios.get('https://netology.ru/backend/api/expert/homeworks', {
		params: {
			q: {
				lesson_task_task_type_eq: 1,
				status_eq: 0
			},
		},
		paramsSerializer: {
			serialize: (params) => qs.stringify(params, {arrayFormat: 'brackets'})
		},
		headers: {
			Cookie: process.env.COOKIE
		}
	});
	return response.data.homeworks
		.filter(data => !data.reviewer)
		.filter(data => data.lesson_task_experts.map(expert => expert.id === +process.env.USER_ID))
		.reduce((acc, {task, user, program}) => {
			return `${acc} \n <b>${task.title}</b>
		<i>${program.pretty_urlcode}</i>
		${user.full_name} \n`
		}, '')
};
const bot = new telegramApi(process.env.TOKEN, { polling: true});
// установили боковое меню
bot.setMyCommands([
	{ command: "returned_from_revision", description: "Вернулись из доработки" },
	{ command: "can_check", description: "Можно брать на проверку" },
]);

bot.on('message', async (message) => {
	const chatId = message.chat.id;
	let template;
	if (message.text === '/returned_from_revision') {
		template = await getSubjectFromRevision() || "Нет доработанных заданий";
	} else if (message.text === '/can_check') {
		template = await getNewSubjectForCheck() || "Нет возможных заданий на проверку"
	}
	bot.sendMessage(chatId, template, {parse_mode : "HTML"})
})


