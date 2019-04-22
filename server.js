let Koa = require('koa');
let router = require('koa-router')();
let static = require('koa-static');
let path = require('path')
let crypto = require('crypto');
let config = require('./config');
let dbConfig = require('./server/database/config');
let logger = require('./server/utils/log.js');
let dbm = require('./server/database/db.js');
let myrouter = require('./server/router/router.js');
const app = new Koa();

staticPath = './static';
//console.log(process.env.NODE_ENV)
let md5 = crypto.createHash('md5');
//let md5Result = md5.update('content').digest('hex');

app.use(static(path.join(__dirname, staticPath)))

app.use(async (ctx, next) => {
    //console.log(`Process: ${ctx.request.method} ${ctx.request.url}`);
    logger.info(`Process: ${ctx.request.method} ${ctx.request.url}`);
    await next();
});

app.use(myrouter.routes());

app.listen(config.webport);
console.log(`server is listening on port ${config.host+':'+config.webport}`)