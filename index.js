const TelegramBot = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options');

const UserResult = require('./models');
const mongoose = require('mongoose');

require('dotenv').config();

const options = {
    polling: true,
    // webHook: {
    //   port: process.env.PORT
    // }
  };
  
//   const url = process.env.APP_URL || 'https://dengenbot.herokuapp.com:443';

  const bot = new TelegramBot(process.env.BOT_TOKEN, options);

//   bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);


let chats = {}

process.on('uncaughtException', err => {
    console.log(err.message);
});

const startGame = async (chatId, userName) => {
    const partTime = Date.now() % 2;
    const partNumber = Math.floor(Math.random() * 10);
    let randomNumber = (partNumber + partTime) % 2;
    chats[userName] = randomNumber;
    await bot.sendMessage(chatId, `Какое число я загадал?`, gameOptions);
}

const connectDB = async () => {
    mongoose
        .connect(process.env.MONGO_URL, {keepAlive: true, keepAliveInitialDelay: 10000 })
        .then(console.log('Connected to DB'))
        .catch(error => console.log(error));
}

const startBot = () => {
    
    try {
        connectDB();
    } catch (error) {
        console.log('Ошибка подключения к БД', error)
    }

    bot.setMyCommands( [
        {command: '/start', description: 'Стартовое приветствие'},
        {command: '/info', description: 'О пользователе'},
        {command: '/clear', description: 'Сброс статистики'},
        {command: '/game', description: 'Игра \'Чётное-Нечётное\''},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        const userName = msg.from.first_name;

        try {            
            if (text === '/start'){
                let newUser = await UserResult.findOne({userName, chatId});
                if (!newUser) {
                    const user = new UserResult({userName, chatId});
                    await user.save({userName, chatId});
                } 

                await bot.sendSticker(chatId, process.env.STICKER_URL);
                return bot
                        .sendMessage(chatId, `Добро пожаловать в dengen-бот!`)
                        .catch(error => console.log(error.message));
            }
        
            if (text === '/info'){
                const user = await UserResult.findOne({userName, chatId});
                return bot
                        .sendMessage(chatId, `Вас зовут ${userName}. Правильных ответов ${user.right}, неправильных ${user.wrong}`)
                        .catch(error => console.log(error.message));
            }
    
            if (text === '/clear'){
                const user = await UserResult.findOne({userName, chatId});
                user.right = user.wrong = 0;
                await user.save({userName, chatId});
                return bot
                        .sendMessage(chatId, 'Статистика сброшена.')
                        .catch(error => console.log(error.message));
            }
    
           if (text === '/game'){
                return startGame(chatId, userName);
            }
    
           return bot
                    .sendMessage(chatId, `Я тебя не понял, повтори`)
                    .catch(error => console.log(error.message));
            
        } catch (error) {
            return bot
                    .sendMessage(chatId, 'Произошла ошибка:' + error.message)
                    .catch(error => console.log(error.message));
        }
    }) 

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const userName = msg.from.first_name;
        const user = await UserResult.findOne({userName, chatId});

        if (data === '/stop'){
            return bot
                    .sendMessage(chatId, `Спасибо за игру!`)
                    .catch(error => console.log(error.message));
        }

        if (data === '/again'){
            return startGame(chatId, userName);
        }

        if (data == chats[userName]) {
            user.right += 1;
            await bot
                    .sendMessage(chatId, `УГАДАЛ!!!`, againOptions)
                    .catch(error => console.log(error.message));
        } else {
            user.wrong += 1;
            await bot
                    .sendMessage(chatId, `Нет, ошибся!`, againOptions)
                    .catch(error => console.log(error.message));
        }

        await user.save();
    })
}

startBot();