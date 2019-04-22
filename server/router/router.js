let Router = require('koa-router');
let mime = require('mime');
let dbm = require('../database/db.js');
let dbConfig = require('../database/config');
let router = Router();

staticPath = '../../static'

function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

router.get('/query', async (ctx, next) => {
  let client = await dbm.getDB();
  let dbo = client.db(dbConfig.dbName)
  let collection = ctx.query['collection'];
  let match = ctx.query['match'];
  match = decodeURIComponent(match);
  let result;
  switch (collection) {
    case 'subjob_of'://获取能力小类
      result = await dbm.queryDB(dbo, 'occupation_classification', {'occupation': match});
      if (result) {
        result.forEach(function(item) {
          item['childclass'] = [...new Set(item['childclass'])];
        })
      }
      break
    case 'exactjob_of'://小类职业含有的细类职业
      result = await dbm.queryDB(dbo, 'exact_occupation', {'occupation': match});
      break
    case 'skills_of_job'://获取小类职业所需技能
      result = await dbm.queryDB(dbo, 'occupation_skills', {'occupation': match});
      break
    case 'description_of'://获取细类职业的描述
      result = await dbm.queryDB(dbo, 'occupation_description', {'occupation': match});
      break
    case 'has_skill'://获取小类职业含有的细类职业，以及小类职业的jobname,jobtext
      result = await dbm.queryDB(dbo, 'occupation_skills', {'skills': {$in: [match]}});
      break
    case 'subskills_of'://获取技能下的细类技能及描述
      result = await dbm.queryDB(dbo, 'skill_classification', {'type': match});
      break

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