let MongoClient = require('mongodb').MongoClient();
let config = require('./config')

module.exports = {
    getDB(callback) {
        MongoClient.connect(config.host+config.dbName, { useNewUrlParser: true }, (err, db) => {
            callback(err, db);
        })
    },
    insertDB(db, collection, obj) {
        db.collection(collection).insertOne(obj, (err, res) => {
            callback(err, res);
        })
    },
    queryDB(db, collection, queryObj, callback) {
        db.collection(collection).find(queryObj).toArray((err, data) => {
            callback(err, data);
        })
    }
}