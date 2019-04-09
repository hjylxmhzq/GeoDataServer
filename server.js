let Koa = require('koa');
let router = require('koa-router')();
let static = require('koa-static');
let path = require('path')
let config = require('./config')
let dbConfig = require('./server/database/config')
let dbm = require('./server/database/db.js')
const app = new Koa();

staticPath = './static';



app.use(static(path.join(__dirname, staticPath)))

app.use(async (ctx, next) => {
    console.log(`Process: ${ctx.request.method} ${ctx.request.url}`)
    await next();
});

router.get('/query/:dataName', async (ctx, next)=>{
    let client = await dbm.getDB();
    let dbo = client.db(dbConfig.dbName)
    let result = await dbm.queryDB(dbo, 'visualDataSet', {'title': ctx.params.dataName})
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(result);
});

app.use(router.routes());

app.listen(config.webport);
console.log(`server is listening on port ${config.webport}`)