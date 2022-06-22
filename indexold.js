const request = require('request');
const cheerio = require('cheerio');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require("./config.json");
const cron = require("node-cron");


const find = require("./findold.js");
let task = {};
let marketList = [];

let commandList = [{command:"addmarket",description:"Adiciona uma loja ao monitoramento. Exemplo: !addmarket 123"},
{command:"addmarketlist",description:"Adiciona uma lista de lojas ao monitoramento. Exemplo: !addmarket 123,1345,1111,444"},
{command:"removemarket",description:"Remove uma loja do monitoramento. Exemplo: !removemarket 123"},
{command:"listmarket",description:"Lista todas as lojas em monitoramento. Exemplo: !listmarket"},
{command:"showmarket",description:"Apresenta todos os dados da loja. Exemplo !showmarket 1234"},
{command:"clearmarketlist",description:"Apaga todas as lojas do monitoramento. Exemplo: !clearmarketlist"},
{command:"cron",description:"Inicia o monitoramento. Exemplo: !cron"},
{command:"cronstop",description:"Pausa o monitoramento. Exemplo: !cronstop"}
];

const prefix = "!";
client.on('message', message => { 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);

    const args = commandBody.split(' ');

    function removeMarketById(idMarket){
        marketList.reverse();
        for (var i = marketList.length -1; i >=0; i--) {
          var market = marketList[i];
          if(market.id === idMarket){
            marketList.splice(i, 1);
            message.reply(`Removendo mercado ${idMarket} da lista de monitoramento.`);
            console.log("Removing market monitoring");
          }
        }
    }
    if (args[0].toLowerCase() === "cronstop") {
        message.reply("Captura pausada");
        task.stop();
    }

    if (args[0].toLowerCase() === "cron") {
        message.reply("Captura iniciada 30 em 30 segundos");
        task = cron.schedule("*/30 * * * * *", () => {
            console.log("Running cronjob");
            if(marketList.length > 0){
                console.log("Initializing market monitoring");
                for (let index = 0; index < marketList.length; index++) {
                    const marketSaved = marketList[index];
                    find.getMarket(marketSaved.id).then(marketFind => {
                        if(!marketFind || !marketFind.name){
                            message.reply(`Loja ${marketSaved.name} não foi mais encontrada, removendo da listagem de busca`);
                            console.log("Market not found, removing from list");
                            removeMarketById(marketSaved.id);
                        } else {
                            console.log("Market found, initializing items comparision");
                            if(marketSaved.items.total > marketFind.items.total){
                                console.log("Item selled, finding selled item");
                                let selledList = [];
                                itemsSaved = marketSaved.items.items;
                                newItems = marketFind.items.items;
                                
                                itemsSaved.forEach(saved => {
                                    let itemFound = false;
                                        newItems.forEach(newItem => {
                                            if(saved.name === newItem.name){
                                                itemFound=true;
                                                if(parseInt(saved.quantity)>parseInt(newItem.quantity)){
                                                    console.log("Item vendido");
                                                    let quantitySelled = parseInt(saved.quantity) - parseInt(newItem.quantity);
                                                    let selled = {name:saved.name,quantity:quantitySelled};
                                                    selledList.push(selled);
                                                }
                                            }
                                        });
                                    if(itemFound == false){
                                        let selled = {name:saved.name, quantity:saved.quantity};
                                        selledList.push(selled);
                                    }
                                });
                                console.log("Sending item selled message");
                                let messageSelled = `Item vendido!\r\nLoja: ${marketSaved.name}\r\nPersonagem: ${marketSaved.charName}\r\n`;
                                messageSelled = messageSelled + ` ----------------- Itens Vendidos ----------------- \r\n`;
                                selledList.forEach(selledItem => {
                                    messageSelled = messageSelled + ` Nome: ${selledItem.name} - Quantidade: ${selledItem.quantity} \r\n`;
                                });
                                messageSelled = messageSelled + ` ----------------------------------------------------------- \r\n`;
                                message.reply(messageSelled);
                                marketList[index] = marketFind;
                            } else {
                                console.log("Didnt have selled items"); 
                            }
                        }
                    }).catch(error=>{
                        console.log(error);
                    });
                }
            } else {
                console.log("Sem lojas para monitorar");
            }
        });
    }


    if (args[0].toLowerCase() === "commands") {
        let commandMessage = '';
        commandList.forEach(command => {
            commandMessage = commandMessage + `Comando: ${command.command} ->  ${command.description} \r\n`;
        });
        message.reply(commandMessage);
    }

    if (args[0].toLowerCase() === "addmarket") {

        find.getMarket(args[1]).then(market => {
            if(!market.name){
                message.reply(`Erro ao tentar adicionar a loja, verifique se ela existe em https://www.kafraportal.com/oldtimes/vending/items/`);
            } else {
                message.reply(`Loja encontrada id: ${market.id} - Loja: ${market.name} - Personagem: ${market.charName} \r\n Adicionando ao monitoramento a loja ${market.id}`);
                marketList.push(market);
            }
            
        }).catch(error=>{
            message.reply(`Erro ao tentar adicionar a loja, verifique se ela existe em https://www.kafraportal.com/oldtimes/vending/items/ \r\n`);
            message.reply( ` Erro não esperado, fale com administrador do sistema ` + error + `\r\n`);  
        });
    }

    if (args[0].toLowerCase() === "addmarketlist") {

        let listMarket = args[1].split(',');
        let marketListMessage = '';
        
        listMarket.forEach(idMarket => {
            console.log(idMarket);
            find.getMarket(idMarket).then(market => {
                if(!market || !market.name){
                    console.log("Market not found");
                    message.reply( ` Erro ao tentar adicionar a loja ${idMarket}, verifique se ela existe em https://www.kafraportal.com/oldtimes/vending/items/ \r\n`);
                } else {
                    console.log("Market found");
                    message.reply( `Loja encontrada id: ${market.id} - Loja: ${market.name} - Personagem: ${market.charName} \r\n Adicionando ao monitoramento a loja ${market.id}`);
                    marketList.push(market);
                }
                
            }).catch(error=>{
                message.reply( ` Erro ao tentar adicionar a loja ${idMarket}, verifique se ela existe em https://www.kafraportal.com/oldtimes/vending/items/ \r\n`);  
                message.reply( ` Erro não esperado, fale com administrador do sistema ` + error + `\r\n`);  
            });
            
        });
    }

    if (args[0].toLowerCase() === "removemarket") {
        removeMarketById(args[1]);
    };
    
    if (args[0].toLowerCase() === "listmarket") {
        let marketListMessage = '';
        if(marketList.length>0){
            marketList.forEach(market => {
                marketListMessage = marketListMessage + `ID: ${market.id} - Nome: ${market.name} - Personagem: ${market.charName}  \r\n`;
            });
            message.reply(`Monitorando as seguintes lojas: \r\n` + marketListMessage);
        } else {
            message.reply('Nenhuma loja monitorada');
        }
    }

    if (args[0].toLowerCase() === "showmarket") {
        let marketListMessage = '';
        marketList.forEach(market => {
            if(market.id == args[1]){
                marketListMessage = marketListMessage + `ID: ${market.id} - Nome: ${market.name} - Personagem: ${market.charName}  \r\n`;
                let items = market.items.items;
                marketListMessage = marketListMessage + ` ----------------------------- Items ----------------------------- \r\n`;
                items.forEach(item => {
                    marketListMessage = marketListMessage + `ID: ${item.identification} - Nome: ${item.name} - Quantidade: ${item.quantity} - Valor: ${item.value} \r\n`;
                });
                marketListMessage = marketListMessage + ` ----------------------------------------------------------------- \r\n`;

                message.reply(marketListMessage);
            } else {
                message.reply(`Loja não monitorada, tente adiciona-la a lista`);
            }
        });
        
    }

    if (args[0].toLowerCase() === "clearmarketlist") {
        marketList = [];
        message.reply(`List de lojas apagadas`);
    }
                                         
});  

client.login(config.BOT_TOKEN);
