const find = require("./find.js");
const cron = require("node-cron");


cron.schedule("*/5 * * * * *", () => {
    console.log("Initializing capture");
    find.getFullDataMarket(1675).then(fullDataMarket => {
        console.log(fullDataMarket);
    }).catch(error=>{
        console.log(error);
    });
});
