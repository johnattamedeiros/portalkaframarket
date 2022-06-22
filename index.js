const request = require('request');
const cheerio = require('cheerio');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require("./config.json");
const cron = require("node-cron");


const find = require("./find.js");

let marketList = [];

cron.schedule("*/5 * * * * *", () => {
    console.log("Initializing market capture");
    if(marketList.length>0){
    marketList.forEach(market => {
        find.getMarketItens(market.id).then(itemsData => {
            console.log(market.id + " quantidade antes "+ market.totalItems  +  " quantidade agora "+itemsData.total);
            if(market.totalItems > itemsData.total){
                message.reply(`Item vendido! Loja: ${market.name} - Personagem: ${market.charName} - Id:${market.id}`);
            }
            market.items = itemsData.items;
            market.totalItems = itemsData.total;
        }).catch(error=>{
            console.log(error);
        });
    });
    } else {
        console.log("Sem lojas para monitorar");
    }
});



let commandList = [
{command:"removemarket",description:"Remove uma loja do monitoramento. Exemplo: !removemarket 123"},
{command:"listmarket",description:"Lista todas as lojas em monitoramento. Exemplo: !listmarket"},
{command:"showmarket",description:"Apresenta todos os dados da loja. Exemplo !showmarket 1234"},
{command:"clearmarketlist",description:"Apaga todas as lojas do monitoramento. Exemplo: !clearmarketlist"},
{command:"addmarketbyname",description:"Adicionar a um monitoramento de loja a partir do nome do personagem. Exemplo: !addmarketbyname nomedopersonagem"}
];

const prefix = "!";
client.on('message', message => { 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);

    const args = commandBody.split(' ');

    if (args[0].toLowerCase() === "commands") {
        let commandMessage = '';
        commandList.forEach(command => {
            commandMessage = commandMessage + `Comando: ${command.command} ->  ${command.description} \r\n`;
        });
        message.reply(commandMessage);
    }

    if (args[0].toLowerCase() === "addmarketbyname") {
        let charName = "";
        let charNameSearch = "";
        for (let index = 0; index < args.length; index++) {
            const arg = args[index];
            if(index > 0){
                charName = charName + arg +" ";
                charNameSearch = charNameSearch + arg +"+";
            }
        }
        charName = charName.trim();
        const regex = /\+$/ig;
        charNameSearch = charNameSearch.replaceAll(regex, "");
        message.reply(`Buscando loja do ${charName}`);

        find.getMarket(charNameSearch).then(market => {
            message.reply(`Loja encontrada id: ${market.id} - Loja: ${market.name} - Personagem: ${market.charName} - Localização: ${market.navi}`);
            message.reply(`Adicionando ao monitoramento a loja ${market.id}`);
            find.getMarketItens(market.id).then(itemsData => {
                market.items = itemsData.items;
                market.totalItems = itemsData.total;
                marketList.push(market);
            }).catch(error=>{
                console.log(error);
            });
        }).catch(error=>{
            message.reply(`Erro ao tentar adicionar a loja, verifique se não digitou nome do personagem incorreto ou a loja está fechada`);
        });
    }

    if (args[0].toLowerCase() === "addmarket") {
        let newMarket = {id:args[1],name:''};
        marketList.push(newMarket);
        message.reply(`Adicionando mercado ${args[1]} a lista de monitoramento.`);
    }

    if (args[0].toLowerCase() === "removemarket") {
        marketList.reverse();
        for (var i = marketList.length -1; i >=0; i--) {
          var market = marketList[i];
          if(market.id === args[1]){
            marketList.splice(i, 1);
            message.reply(`Removendo mercado ${args[1]} da lista de monitoramento.`);
          }
        }
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
                let items = market.items;
                marketListMessage = marketListMessage + ` ----------------- items ----------------- \r\n`;
                items.forEach(item => {
                    marketListMessage = marketListMessage + `ID: ${item.identification} - Nome: ${item.name} - Quantidade: ${item.quantity} - Valor: ${item.value} \r\n`;
                });
                marketListMessage = marketListMessage + ` ---------------------------------- \r\n`;

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
