const request = require('request');
const cheerio = require('cheerio');

const getMarket = function(idMarket) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            url: 'https://www.kafraportal.com/oldtimes/vending/viewshop/?id='+idMarket,
            headers: {
            },
        }, (err, res, body) => {
            if (err) return reject(e);
            try {
                const $ = cheerio.load(body);
                let market = {};
                let marketItens = {items:[], total:0};
                let charName = '';
                let marketName = '';
                let mainInfo = $(".maininfo").map(function() {

                    let mainInfoName = $(this).find('h2').map(function() {
                        const regex = /\t|\r?\n|\r|(Loja do jogador )/g;
                        let returnMainInfo = $(this).text();
                        return returnMainInfo.replaceAll(regex, "");
                    }).toArray();
                    charName = mainInfoName[1];

                    if(charName.indexOf("NO VENDOR FOUND") !== -1){
                        resolve(null);
                        return;
                    }

                    let mainInfoMarketName = $(this).find('h3').map(function() {
                        const regex = /\t|\r?\n|\r/g;
                        let returnMainInfoMarketName = $(this).text();
                        return returnMainInfoMarketName.replaceAll(regex, "");
                    }).toArray();
                    marketName = mainInfoMarketName[0];
                }).toArray();
                $(".horizontal-table > tbody > tr").map(function() {
                    let itemTable = $(this).find('td').map(function() {
                        const regex = /\t|\r?\n|\r|(                  )|(                )/g;
                        let returnItemData = $(this).text();
                        return returnItemData.replaceAll(regex, "");
                    }).toArray();

                    let item = {identification:itemTable[0].trim(), name:itemTable[1].trim(), quantity:itemTable[7].trim(), value:itemTable[6].trim()}
                    marketItens.items.push(item);
                    marketItens.total = parseInt(marketItens.total) + parseInt(itemTable[7]);
                }).toArray();

                market.name = marketName.trim();
                market.items = marketItens;
                market.charName = charName.trim();
                market.id = idMarket;
                
                resolve(market);
            } catch (e) {
                reject(e);
            }
        });
    });
}

module.exports ={
    getMarket
}