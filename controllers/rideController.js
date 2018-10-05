var db = require('../src/dbConnection');
var createTkn = require('../src/createToken');
var mail = require('../src/sendMail');
var jwt = require('jsonwebtoken');
var uniqid = require('uniqid');
var schedule = require('node-schedule');
var async = require('async');
var interval = 15; // interval for rebook when not checkin for 15 mins
var cronInterval = '0 */15 * * * *';
module.exports.controller = function (app) {
    app.post('/api/register/user', function (req, res) {
        var dataObj;
        if (req.body.userObj) {
            dataObj = req.body.userObj;
        } else {
            dataObj = req.body
        }
        var sql = 'INSERT INTO users SET ?;'
        dataObj = {
            Id: uniqid(),
            firstName: dataObj.firstName,
            lastName: dataObj.lastName,
            userName: dataObj.userName,
            phone: dataObj.phone,
            passWord: dataObj.passWord,
            fav_places: dataObj.fav_places,
            isActive: 1,
            role: dataObj.role,
            updatedAt: new Date(),
            createdAt: new Date(),
            ridePlace: dataObj.ridePlace,
            isDeleted: 0
        }
        db.query(sql, dataObj, function (err, data) {
            if (err)
                res.send(err)
            else
                res.send(data)
        })
    })
    app.post('/api/register/driver', function (req, res) {
        var dataObj;
        if (req.body.driverObj) {
            dataObj = req.body.driverObj;
        } else {
            dataObj = req.body
        }
        var sql = 'INSERT INTO drivers SET ?;'
        dataObj = {
            Id: uniqid(),
            firstName: dataObj.firstName,
            lastName: dataObj.lastName,
            userName: dataObj.userName,
            phone: dataObj.phone,
            vehicleNumber: dataObj.vehicleNumber,
            vehicleType: dataObj.vehicleType,
            vehicleColor: dataObj.vehicleColor,
            passWord: dataObj.passWord,
            vehicleLocation: JSON.stringify(dataObj.vehicleLocation),
            isActive: 1,
            role: 'Driver',
            isDeleted: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        db.query(sql, dataObj, function (err, data) {
            if (err)
                res.send(err)
            else
                res.send(data)
        })
    })
    app.get('/api/drivers', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.send(err, null);
            }
            else {
                var sql = '';
                if (resData.data.role === 'Admin') {
                    sql = 'SELECT * FROM drivers';
                } else if (resData.data.role === 'Driver') {
                    sql = `SELECT * FROM drivers where id = '` + resData.data.id + `' AND isDeleted = 0`;
                } else {
                    sql = '';
                }
                db.query(sql, '', function (err, data) {
                    if (err && err.errno === 1065)
                        res.send('You Dont Have Permissions');

                    else if (err)
                        res.send(err, null);
                    else
                        res.send(data)
                })

            }
        })
    })
    app.get('/api/users', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.status(500).send((err));
            } else {
                var sql = '';
                if (resData.data.role === 'Admin') {
                    sql = 'SELECT * FROM users';
                } else if (resData.data.role === 'End User') {
                    sql = `SELECT * FROM users where id = '` + resData.data.id + `' AND isDeleted = 0`;
                } else {
                    sql = '';
                }
                db.query(sql, '', function (err, data) {
                    if (err && err.errno === 1065)
                        res.status(400).send(('You Dont Have Permissions'));
                    else if (err)
                        res.status(500).send((err));
                    else
                        // res.send(err, data)
                        res.status(200).send((data));
                })
            }
        })
    })
    app.post('/api/login/:type', function (req, res) {
        var loginData;
        if (req.body.loginObj) {
            loginData = req.body.loginObj;
        } else {
            loginData = req.body
        }
        try {
            if (req.params.type === 'user') {
                var sql = `SELECT *, 'user' as type FROM users where userName = '` + loginData.userName + `' AND passWord = '` + loginData.passWord + `'`;
                db.query(sql, '', function (err, data) {
                    if (err)
                        res.send(err)
                    else
                        if (data && data.length > 0) {
                            data = data[0];
                            var tokenData = {
                                'id': data.Id, 'userName': data.UserName,
                                'firstName': data.firstName, 'lastName': data.lastName, 'role': data.role
                            };
                            createTkn.generateToken(tokenData, function (err, token) {
                                if (err) {
                                    res.send('Login Failed');
                                } else {

                                    res.send({ message: 'Login Succesfully', token: token });
                                }
                            })
                        } else {
                            res.send({ message: 'Login Failed' });
                        }
                })
            } else {
                var sql = `SELECT *, 'driver' as type FROM drivers where userName = '` + loginData.userName + `' AND passWord = '` + loginData.passWord + `'`;
                db.query(sql, '', function (err, data) {
                    if (err)
                        res.send(err)
                    else
                        if (data && data.length > 0) {
                            data = data[0];
                            var tokenData = {
                                'id': data.Id, 'userName': data.UserName,
                                'firstName': data.firstName, 'lastName': data.lastName
                            };
                            createTkn.generateToken(tokenData, function (err, token) {
                                if (err) {
                                    res.send('Login Failed');
                                } else {
                                    res.send({ message: 'Login Succesfully', token: token });
                                }
                            })
                        } else {
                            res.send({ message: 'Login Failed' });
                        }
                })
            }
        } catch (exp) {
            res.send('someThing Went Wrong', exp);
        }
    })
    app.post('/api/book/ride', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.status(500).send((err));
            }
            else {
                if (resData.data.role === 'End User') {
                    var sql = 'SELECT * FROM `drivers` where isActive = 1';
                    var rideObj;
                    if (req.body.rideObj) {
                        rideObj = req.body.rideObj;
                    } else {
                        rideObj = req.body
                    }
                    bookRide(sql, resData, rideObj, function (err, data) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(data)
                        }
                    })
                }
            }
        })
    })
    app.get('/api/ride/checkin', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.send(err, null);
            }
            else {
                if (resData.data.role === 'End User') {
                    var sql = 'SELECT * FROM `ridesLog` where isActive = 1 AND status = "Booked" AND userId = "' + resData.data.id + '"';
                    db.query(sql, '', function (err, data) {
                        if (err) {
                            res.send(err)
                        } else {
                            if (data && data.length > 0) {
                                var sql = 'UPDATE ridesLog SET  status="CheckedIn", startAt = "' + new Date() + '" WHERE Id = "' + data[0]['Id'] + '"';
                                db.query(sql, '', function (err, data) {
                                    if (err)
                                        res.send(err)
                                    else
                                        res.send(data)
                                })
                            } else {
                                res.send('No Rides Avaliable')
                            }
                        }
                    })
                }
            }
        })
    })
    app.get('/api/getrides', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.send(err, null);
            }
            else {
                var sql = '';
                if (resData.data.role === 'End User') {
                    sql = `SELECT r.*, concat(u.firstName, " ", u.lastName) userName, concat(d.firstName, " ", d.lastName) driverName FROM ridesLog r LEFT JOIN drivers d on d.Id = r.driverId LEFT JOIN users u on u.Id = r.userId  where u.Id = '` + resData.data.id + `' GROUP BY r.Id`;
                } else {
                    sql = `SELECT r.*, concat(u.firstName, " ", u.lastName) userName, concat(d.firstName, " ", d.lastName) driverName FROM ridesLog r LEFT JOIN drivers d on d.Id = r.driverId LEFT JOIN users u on u.Id = r.userId where d.Id = '` + resData.data.id + `' GROUP BY r.Id `;
                }
                db.query(sql, '', function (err, data) {
                    if (err)
                        res.send(err)
                    else
                        res.send(data)
                })
            }
        })
    });
    app.put('/api/ride/cancel/:rideId', function (req, res) {
        createTkn.validateToken(req.headers.token, function (err, resData) {
            if (err) {
                res.send(err, null);
            }
            else {
                var sql = `UPDATE ridesLog SET status= 'Cancel', cancelledBy = '` + resData.data.id + `' WHERE Id = '` + req.params.rideId + `'`;
                db.query(sql, '', function (err, data) {
                    if (err) {
                        res.send(err)
                    } else {
                        var sql1 = `select * from ridesLog where Id = '` + req.params.rideId + `'`
                        db.query(sql1, '', function (err, data) {
                            if (err) {
                                res.send(err)
                            } else {
                                if (data && data.length > 0) {
                                    var obj = {};
                                    var temp = data[0].fromLocation;
                                    var temp1 = data[0].toLocation;
                                    obj.lat1 = JSON.parse(temp).lat;
                                    obj.long1 = JSON.parse(temp).long;
                                    obj.lat2 = JSON.parse(temp1).lat;
                                    obj.long2 = JSON.parse(temp1).long;
                                    var bookSql = `SELECT * FROM drivers WHERE Id not in ('` + data[0]['driverId'] + `')`
                                    bookRide(bookSql, resData, obj, function (err, data) {
                                        if (err) {
                                            res.send(err);
                                        } else {
                                            res.send(data)
                                        }
                                    })
                                }
                            }
                        });
                    }
                })
            }
        })
    });
    var rmdJob = schedule.scheduleJob(cronInterval, function () {
        var sql = `
    SELECT
        r.Id rideId,
        r.userId,
        r.driverId,
        r.fromLocation,
        r.toLocation,
        u.firstName,
        u.lastName,
        u.Id uId,
        r.STATUS
        ,
        DATE_FORMAT(r.createdAt, '%Y:%m:%d %h:%i'),
        DATE_SUB(
            DATE_FORMAT(NOW(), '%Y:%m:%d %h:%i'),
            INTERVAL 27 MINUTE)
    FROM
            ridesLog r
            LEFT JOIN users u on u.Id = r.userId
        WHERE
    STATUS
        = 'Booked' AND DATE_FORMAT(r.createdAt, '%Y-%m-%d %h:%i:00') = DATE_SUB(
            DATE_FORMAT(NOW(), '%Y:%m:%d %h:%i'),
            INTERVAL `+ interval + ` MINUTE) GROUP BY r.Id`;
        db.query(sql, '', function (err, data) {
            if (err) {
                res.send(err)
            } else {
                if (data && data.length > 0) {
                    var updateSql = '';
                    async.each(data, function (obj1, next) {
                        var obj = {};
                        var temp = obj1.fromLocation;
                        var temp1 = obj1.toLocation;
                        obj.lat1 = JSON.parse(temp).lat;
                        obj.long1 = JSON.parse(temp).long;
                        obj.lat2 = JSON.parse(temp1).lat;
                        obj.long2 = JSON.parse(temp1).long;
                        var resData = {};
                        resData.data = {};
                        resData.data.firstName = obj1.firstName;
                        resData.data.lastName = obj1.lastName;
                        resData.data.id = obj1.uId
                        updateSql += 'UPDATE ridesLog SET status= "Cancel", cancelledBy = "Server" WHERE Id = "' + obj1.rideId + '"; ';
                        var bookSql = `SELECT * FROM drivers WHERE Id not in ('` + obj1['driverId'] + `')`
                        bookRide(bookSql, resData, obj, function (err, data) {
                            if (err) {
                                res.send(err);
                            } else {

                            }
                        })
                    });

                    db.query(updateSql, '', function (cancelErr, cancelData) {
                        if (err) {
                            console.error(cancelErr)
                        } else {
                            console.info(cancelData)
                        }
                    });
                }
            }
        });
    })
};
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
}
function bookRide(sql, resData, rideObj, callback) {
    db.query(sql, '', function (err, data) {
        if (err) {
            callback(err)
        } else {
            if (data && data.length > 0) {
                var dist = [];
                var driverData = [];
                for (var i = 0; i < data.length; i++) {
                    var temp = data[i]['vehicleLocation'];
                    var tempDist = distance(JSON.parse(temp).lat, JSON.parse(temp).long, rideObj.lat2, rideObj.long2, 'K')
                    dist.push(tempDist);
                    driverData.push({
                        Id: data[i]['Id'], dist: tempDist,
                        Name: data[i]['firstName'] + ' ' + data[i]['lastName'],
                        email: data[i]['userName'], phone: data[i]['phone']
                    });
                }
                dist = dist.sort(function (a, b) { return a - b });
                driverData = driverData.filter((obj) => obj.dist === dist[0])[0];
                var dataObj = {
                    Id: uniqid(),
                    userId: resData.data.id,
                    driverId: driverData['Id'],
                    fromLocation: JSON.stringify({ "lat": rideObj.lat1, "long": rideObj.long1 }),
                    toLocation: JSON.stringify({ "lat": rideObj.lat2, "long": rideObj.long2 }),
                    startAt: '',
                    endAt: '',
                    status: 'Booked',
                    distance: driverData['dist'].toFixed(2),
                    // Amount: 50,
                    // Duration: 15,
                    isActive: 1,
                    isDeleted: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),

                }
                var sql = 'INSERT INTO ridesLog SET ?;'
                db.query(sql, dataObj, function (err, data) {
                    if (err) {
                        callback(err)
                    } else {
                        var subject = 'You Have a Ride';
                        var message = 'Hi ' + driverData.Name + ' you have a ride with ' + resData.data.firstName + ' ' + resData.data.lastName;
                        mail.sendemail(driverData.email, message, subject, '', '', function (mailErr, mailData) {
                            callback(err, data);
                        })
                    }
                })
            } else {
                callback('No Rides Avaliable')
            }
        }
    })
}

