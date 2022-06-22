const find = require("./findold.js");



find.getMarket(222).then(fullDataMarket => {
    console.log(fullDataMarket);
}).catch(error=>{
    console.log(error);
});