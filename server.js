let Koa = require('koa');
let router = require('koa-router')();
let static = require('koa-static');
let path = require('path')
let config = require('./config')
let db = require('./server/database/db.js')
const app = new Koa();

staticPath = './static';

app.use(static(path.join(__dirname, staticPath)))

app.use(async (ctx, next) => {
    console.log(`Process: ${ctx.request.method} ${ctx.request.url}`)
    await next();
})

router.get('/query', async (ctx, next)=>{
    ctx.response.type = 'text/html';
    ctx.response.body = 'hello world';
})

app.use(router.routes());

app.listen(config.webport);
console.log(`server is listening on port ${config.webport}`)