const TelegramBot = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options');

// t.me/dengen_user_bot
const botToken = '5745655939:AAHPP7QStpYkFV75uyeMYlChH7Ld1Re3htg'

let bot = new TelegramBot(botToken, {polling: true});

let chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Я загадаю число от 0 до 9. Отгадаешь?`);
    let randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Угадывай!`, gameOptions);
}

const startBot = () => {
    bot.setMyCommands( [
        {command: '/start', description: 'Стартовое приветствие'},
        {command: '/info', description: 'О пользователе'},
        {command: '/game', description: 'Игра "Угадай число'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start'){
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/0e3/159/0e315900-c335-352c-b746-124d5b940ac2/1.webp');
            return bot.sendMessage(chatId, `Добро пожаловать в dengen-бот!`);
        }
    
        if (text === '/info'){
            return bot.sendMessage(chatId, `Вас зовут ${msg.from.first_name} ${msg.from.last_name}`);
        }

        if (text === '/game'){
            return startGame(chatId);
        }

       return bot.sendMessage(chatId, `Я тебя не понял, повтори`);

    }) 

    bot.on('callback_query', msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/stop'){
            bot.sendMessage(chatId, `Спасибо за игру!`);
            return bot.close();
        }

        if (data === '/again'){
            return startGame(chatId);
        }

        if (data == chats[chatId]) {
            return bot.sendMessage(chatId, `КРУТ!!! Угадал цифру ${chats[chatId]}!`, againOptions);
        } else {
            return bot.sendMessage(chatId, `Нет, я загадал цифру ${chats[chatId]}!`, againOptions);
        }
    })
}

startBot();