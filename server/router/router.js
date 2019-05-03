let Router = require('koa-router');
let mime = require('mime');
let dbm = require('../database/db.js');
let dbConfig = require('../database/config');
let Cache = require('../utils/cache.js');

let router = Router();

staticPath = '../../static'

cache = new Cache(100);

function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

router.get('/query', async (ctx, next) => {
  let result, r;
  let collection = ctx.query['collection'];
  let omatch = ctx.query['match'];
  if (cache.has(collection + '|' + omatch)) {
    result = cache.get(collection + '|' + omatch);
  } else {
    let client = await dbm.getDB();
    let dbo = client.db(dbConfig.dbName)

    match = decodeURIComponent(omatch);

    switch (collection) {
      case 'subjob_of'://从职业中类获取职业小类
        r = await dbm.queryDB(dbo, 'occupation_classification', { 'secondary_type': match });
        if (result) {
          let child = r.map((item, index) => {
            return item['third_type'];
          })
          child = [...new Set(child)];
          result = [{ 'name': match, childclass: child }];
        }
        break
      case 'exactjob_of'://小类职业含有的细类职业
        r = await dbm.queryDB(dbo, 'occupation_classification', { 'third_type': match });
        let child = r.map((item, index) => {
          return item['name'];
        })
        result = [...new Set(child)];

        break
      case 'skills_of_job'://获取小类职业所需技能，以及小类职业的jobname,jobtext
        result = await dbm.queryDB(dbo, 'occupation_skills', { 'name': match });
        break
      case 'description_of'://获取细类职业的描述
        result = await dbm.queryDB(dbo, 'occupation_classification', { 'name': match });
        break
      case 'has_skill'://获取含有这种技能的小类职业
        result = await dbm.queryDB(dbo, 'occupation_skills', { 'skills': { $in: [match] } });
        if (result) {
          for (let data of result) {
            delete data.skills;
            let occupation = await dbm.queryDB(dbo, 'occupation_classification', { 'third_type': data['name'] });
            if (occupation.length) {
              r = occupation[0]['first_type'];
              data['type'] = r;
            }
          }
        }
        break
      case 'subskills_of'://获取技能下的细类技能及描述
        result = await dbm.queryDB(dbo, 'skill_classification', { 'type': match });
        break
      case 'skill_description'://输入小类技能，获取细类技能的详细信息
        result = await dbm.queryDB(dbo, 'skill_classification', { $or: [{ 'skills': match }, { 'Label': match }] });
        break
    }
    cache.set(collection+'|'+omatch, result);
  }
  //console.log(result)
  ctx.type = 'application/json';
  ctx.response.set({
    'Access-Control-Allow-Origin': '*'
  })
  ctx.body = JSON.stringify(result);
  await next();
});

module.exports = router;