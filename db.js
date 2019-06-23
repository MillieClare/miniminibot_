﻿const sqlite3 = require("sqlite3").verbose();
module.exports = {
    dbCheck: dbCheck,
    getFanfares: getSoundList,
};
function getDB() {
    let db = new sqlite3.Database("mbdb.db", (err) => {
        if (err) { console.error(err.message); }
    });

    return db;
}

function dbCheck() {
    let db = getDB();
    let success = db === undefined ? false : true;
    if (success) {
        console.log("Connection to db was successful");
        db.close();
    }
    return success;
}

function getDBdata(sql, callback) {
    let db = getDB();
    db.all(sql, [], function (err, rows) {
        if (err || rows.length < 1 ) {
            callback("No data", null);
        } else {
            callback(null, rows);
            db.close();
        }
    });
}

function getSoundList(type, category = "", name = "", callback) {
    let sql = `SELECT name, category, filename FROM Sounds WHERE enabled = true AND type = \"${type}\"`;
    if (category != "") {
        sql += ` AND category = \"${category}\"`;
    }
    if (name != "") {
        sql += ` AND name = \"${name}\"`;
    }
    getDBdata(sql, function (err, rows) {
        if (err) {
            callback(err, null);
        } else {
            let tmp = [];
            rows.forEach(function (row) {

                tmp.push({
                    name: row.name,
                    category: row.category,
                    filename: row.filename,
                });
            });
            callback(null, tmp);
        }
    });
}

