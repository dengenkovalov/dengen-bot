module.exports = {
    gameOptions: {
        reply_markup:   JSON.stringify( {
            inline_keyboard: [
                [{text: 'ЧЁТНОЕ', callback_data: '0'}, {text: 'НЕЧЁТНОЕ', callback_data: '1'}],
            ]
        })
    },
    
    againOptions: {
        reply_markup:   JSON.stringify( {
            inline_keyboard: [
                [{text: 'Ещё разок', callback_data: '/again'}, {text: 'Стоп', callback_data: '/stop'}],
            ]
        })
    }   
}