const sqlite3 = require("sqlite3").verbose();
module.exports = {
    dbCheck: dbCheck,
    getFanfares: getSoundList,
    getSublist: getSubList,
    getResponses: getResponses,
    addQuote,
    getCurrency,
    changeCurrency,
    checkUser,
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

function writeDBdata(sql, callback) {
    let db = getDB();
    db.run(sql, function (err) {
        if (err) {
            console.error(err);
            callback(err, false);
        } else {
            callback(null, true);
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

function getSubList(callback) {
    let sql = 'SELECT username, songfile FROM Sublist';
    getDBdata(sql, function (err, rows) {
        if (err) {
            callback(err, null);
        } else {
            let tmp = [];
            rows.forEach(function (row) {
                tmp[row.username] = {
                    welcomesong: row.songfile,
                    welcomed: false,
                };
            });
            callback(null, tmp);
        }
    });
}

function getResponses(type, callback) {
    let sql = `SELECT response FROM Responses WHERE type = \"${type}\"`;
    getDBdata(sql, function (err, rows) {
        if (err) {
            callback(err, null);
        } else {
            let tmp = [];
            rows.forEach(function (row) {
                tmp.push(row.response);
            });
            callback(null, tmp);
        }
    });
}

function addQuote(quote, username, callback) {
    let sql = `INSERT INTO Responses (response, type, addedby) VALUES (\"${quote}\", \"quote\", \"${username}\")`;
    writeDBdata(sql, function (err, success) {
        if (err || !success) {
            callback("Unable to add quote");
        } else {
            callback("Quote was added successfully");
        }
    });
}

function checkUser(username, callback) {
    getCurrency(username, function (err, rows) {
        if (err) {
            addUserMiniBux(username, function (err) {
                callback(err);
            });
        } else {
            callback(null);
        }
    });
}

function addUserMiniBux(username, callback) {
    let sql = `INSERT INTO Currency (username, currency) VALUES (\"${username}\", 100)`;
    writeDBdata(sql, function (err, success) {
        if (err || !success) {
            callback("User was not added to currency table");
        } else {
            callback("User was successfully added");
        }
    })
}

function getCurrency(username, callback) {
    let sql = `SELECT currency FROM Currency WHERE username=\"${username}\"`;
    getDBdata(sql, function (err, rows) {
        if (err) {
            callback("No user found in table", null);
        } else {
            callback(null, rows[0].currency)
        }
    });
}

function changeCurrency(currency, username, callback) {
    let sql = `UPDATE Currency SET currency=${currency} WHERE username=\"${username}\"`;
    writeDBdata(sql, function (err, success) {
        if (err || !success) {
            callback("Currency was not updated", null)
        }
        callback(null, "Minibux added!");
    })
}

