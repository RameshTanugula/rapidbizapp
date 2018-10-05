var app = require('../app');
// Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('To Users Mocha `Testing', () => {
    var userToken;
    var invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6IlVzZXIiLCJyb2xlIjoiRW5kIFVzZXIifSwiaWF0IjoxNTM4NzM0MTk4LCJleHAiOjE1NzQ3MzQxOTh9.O_AJvysfP5W77GWiZ0oFIP-8qMn4cHfiG6tJmuxzNIc123456';
    var driverToken;
    var cancelRideId;
    var userObj = {
        "firstName": "ramesh",
        "lastName": "t",
        "userName": "ramesh@gmail.com",
        "passWord": "welcome",
        "phone": "123456",
        "fav_places": "no",
        "ridePlace": "no",
        "role": "End User"
    }
    var driverObj = {
        "firstName": "Driver",
        "lastName": "nine",
        "userName": "driver@nine.com",
        "phone": "94358848",
        "vehicleNumber": "kjdf98s",
        "vehicleType": "kmndf00",
        "vehicleColor": "red",
        "passWord": "welcome",
        "vehicleLocation": JSON.stringify({ "lat": "17.439930", "long": "78.498276" })
    }
    describe('To create users data Testing', () => {
        it('To create users - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/register/user').send(userObj).end((err, res) => {
                if (err) {
                    console.log('login user data status :', res.body.message);
                } else {
                    console.log('login user data status :', res.body);
                }
            });
        });
        // });
        it('To create Drivers - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/register/driver').send(driverObj).end((err, res) => {
                if (err) {
                    console.log('login user data status :', res.body.message);
                } else {
                    console.log('login user data status :', res.body);
                }
            });
        });
    });
    describe('To login users data Testing', () => {
        var loginObj = {
            "userName": userObj.userName,
            "passWord": userObj.passWord
        }
        it('To login users - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/login/user').send(loginObj).end((err, res) => {
                userToken = res.body.token;
                if (err) {
                    console.log('login user data status :', res.body.message);
                } else {
                    console.log('login user data status :', res.body);
                }
            });
        });
    });
    describe('To book a ride Testing', () => {
        var rideObj = {
            "lat1": 17.500010,
            "lat2": 17.439930,
            "long1": 78.401527,
            "long2": 78.498276
        }
        it('To book a ride - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/book/ride').set('token', userToken).send(rideObj).end((err, res) => {
                if (err) {
                    console.log('book a ride data status :', res.body.message);
                } else {
                    console.log('book a ride data status :', res.body);
                }
            });
        });
    });
    describe('To login drivers data Testing', () => {
        var loginObj = {
            "userName": driverObj.userName,
            "passWord": driverObj.passWord
        }
        it('To login driver - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/login/driver').send(loginObj).end((err, res) => {
                driverToken = res.body.token;
                if (err) {
                    console.log('login driver data status :', res.body.message);
                } else {
                    console.log('login driver data status :', res.body);
                }
            });
        });
    });
    describe('To login users data Testing', () => {
        var loginObj = {
            "userName": "test1@user1dd.csdafdom",
            "passWord": "welcome"
        }
        it('To login users - negative with in vali details', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).post('/api/login/user').send(loginObj).end((err, res) => {
                if (err) {
                    console.log('login data status :', res.body.message);
                } else {
                    console.log('login data status :', res.body);
                }
            });
        });
    });

    describe('To get users data Testing', () => {
        it('To get users - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).get('/api/users').set('token', userToken).end((err, res) => {
                if (err) {
                    console.log('get users data status :', res.body.message);
                } else {
                    console.log('get users data status :', res.body);
                }
            });
        });
    });
    describe('To get rides data Testing', () => {
        it('To get rides driver - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).get('/api/getrides').set('token', userToken).end((err, res) => {
                if (err) {
                    console.log('rides data status :', res.body.message);
                } else {
                    cancelRideId = res.body[0]['Id'];
                    console.log('dides data status :', res.body);
                }
            });
        });
    });
    describe('To cancel ride data Testing', () => {
        it('To cancel ride - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).put('/api/ride/cancel/' + cancelRideId).set('token', userToken).end((err, res) => {
                if (err) {
                    console.log('cancel ride data status :', res.body.message);
                } else {
                    console.log('cancel ride data status :', res.body);
                }
            });
        });
    });
    describe('To get Checkin data Testing', () => {
        it('To get Checkin driver - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).get('/api/ride/checkin').set('token', userToken).end((err, res) => {
                if (err) {
                    console.log('get Checkin driver data status :', res.body.message);
                } else {
                    console.log('get Checkin driver data status :', res.body);
                }
            });
        });
    });
    describe('To get rides data Testing', () => {
        it('To get rides - Postive', function (done) {
            this.timeout(5000);
            setTimeout(done, 3000);
            chai.request(app).get('/api/drivers').set('token', driverToken).end((err, res) => {
                if (err) {
                    console.log('get rides data status :', res.body.message);
                } else {
                    console.log('get rides data status :', res.body);
                }
            });
        });
    });
});
