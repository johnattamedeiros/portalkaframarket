const find = require("./findold.js");



find.getMarket(1302).then(fullDataMarket => {
    console.log(fullDataMarket);
}).catch(error=>{
    console.log(fullDataMarket);
});