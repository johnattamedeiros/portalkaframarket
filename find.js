const request = require('request');
const cheerio = require('cheerio');

const getMarket = function(charNameSearch) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kafraportal.com/market/vend/list?search='+charNameSearch,
            headers: {
            },
        }, (err, res, body) => {
            if (err) return reject(e);
            try {
                const $ = cheerio.load(body);
                let dataMarket = $(".table-default > tbody > tr > td").map(function() {
                    const regex = /\t|\r?\n|\r/g;
                    let returnData = $(this).text();
                    return returnData.replaceAll(regex, "");
                
                }).toArray();
                
                resolveDataMarket = {id:dataMarket[0],name:dataMarket[1],charName:dataMarket[2],navi:dataMarket[4]};
                resolve(resolveDataMarket);
            } catch (e) {
                reject(e);
            }
        });
    });
}

const getMarketItens = function(idMarket) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kafraportal.com/market/vend/index/?vid='+idMarket+'&vstatus=1',
            headers: {
            },
        }, (err, res, body) => {
            if (err) return reject(e);
            try {
                const $ = cheerio.load(body);
                let marketItens = {items:[], total:0}
                let quantityItens = 0;
                let dataMarket = $(".table-default > tbody > tr").map(function() {

                    const regex = /\t|\r?\n|\r/g;

                    let itemTable = $(this).find('td').map(function() {
                        const regex = /\t|\r?\n|\r/g;
                        let returnItemData = $(this).text();
                        return returnItemData.replaceAll(regex, "");
                    }).toArray();

                    let nameIdSplited = itemTable[1].split('#');
                    let item = {identification:nameIdSplited[1], name:nameIdSplited[0], quantity:itemTable[2], value:itemTable[3]}
                    marketItens.items.push(item);
                    marketItens.total = marketItens.total + parseInt(itemTable[2]);
                }).toArray();
                
                resolve(marketItens);
            } catch (e) {
                reject(e);
            }
        });
    });
}

module.exports ={
    getMarket,getMarketItens
}