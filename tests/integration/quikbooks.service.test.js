// const QuickbooksService = require('../../src/services/integration/quickbooks.service');

// const assert = require('assert');
// const qbService = new QuickbooksService();

// const accessJsonObj = {
//     "x_refresh_token_expires_in": 8726400,
//     "id_token": "",
//     "refresh_token": "",
//     "access_token": "",
//     "token_type": "bearer",
//     "expires_in": 3600
// }

// const fakeIntegrationObject = {
//     realmId: 4620816365172399230,
//     accessUpdated: new Date(),
//     accessJson: JSON.stringify(accessJsonObj),
//     refreshTokenUpdated: new Date()
// }

// // const realAccessJson = `{"x_refresh_token_expires_in":8726400,"id_token":"eyJraWQiOiJPUElDUFJEMDkxODIwMTQiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1ZTkzMThkMS1jNjkzLTQ5MDMtOWZkZi0xNzZiY2Q0NjZiZmYiLCJhdWQiOlsiQUJqRDM5b0V6UTdRelZ2aEZXRkJKTGZQckdaVGFodFdkNzVPaG9HU0t3YXU1RUVDdGkiXSwicmVhbG1pZCI6IjQ2MjA4MTYzNjUxNzIzOTkyMzAiLCJhdXRoX3RpbWUiOjE2MjYxODU5MTcsImlzcyI6Imh0dHBzOlwvXC9vYXV0aC5wbGF0Zm9ybS5pbnR1aXQuY29tXC9vcFwvdjEiLCJleHAiOjE2MjYxODk4MDMsImlhdCI6MTYyNjE4NjIwM30.PqTkM7DkkSJSGZJ2Ylr9Wi6E5ItxxtF1Zhp7PjGH3QZ4Ja0EaEXaBB0rs4qM5Rey9kbd4p-g95P0wTrbQfdG3O9u6R3JtW2PnI6FipsFXWq37KcrKNRj6BOicq4AsljzZk3rJkbFmcQZFJ64_Gsz3IKeQV3f41D6vyWWQT-Jtlg","refresh_token":"AB11634912603arfn8AaxtezNnzcwXU4MmW6u5y4nNUW3vFDr0","access_token":"eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..OFG1peX93q8Vx2FANkB6cg.a6CCFxNB1Sw5cXY1_qu8r2Cbpj1K_QB-krSx6786RIKEW6bdBWTHtqJePj_dhJT0J250rIZdg7GQZ-JYbDwSI_URNVEbEY24WQ10QiHrnQZq0Q2ohcxkYcYb-ypUB-c0tUgF32b-mojjbvAo_k5FUkuU4zJrNbaKuS0hSVJrGLV49aEyAF66-3TM_XvfgOmYuTbANvfjLrQuYctNhyv-mFQbUftInRb-1gIMB4ISaVwKMVdsd8GajMV286Z-9OLWJhKPgw9mzfn2x65e1NctKoZaXHgzT3oed8Y7PXUyAq8MNzWG7hBCk_yoOOiN2tlYytF3iPNAtyVHpqaHEte-fmdANLpnoyoeM5Yd6HJwyETMenABsJqoN3Aahkhz5wrAy91wyodnNhRnpqCtsrQWU4kQctQzGN-iLT1wQPH9Yxvz7-UvaStD9qKjrQt3il9nB8-OoHv9mJ7OE2bOYqt3GdlXpm-AnP1ti_1pmudfb2dE9aD-qq5P6KmP0Gnd2tOmtibcYZcAIAxGjKdiOHcu2S7pjf8oeDhDq-8qV4j1iR7_3nNDWdrE5AqlVUlX2a08it2xK1kR6xACz5oTg3j3vfKRv4X9_rXnadNwrX2a3EV6ch1xAEQOU6tKcozKgvsdNZmIxbD9J8lhPoO10djZjFXRBgtyB5rMpljxBMhEiBt0-EZhGr79k9wqrGICHAFXIN9x5_uTaqXfYXAvcCLzT0THsGrQQ3GbkJ5qcCHkvxIkPPRYbTV_eOYO_6eQA4X0sN87OxLsw2NbxGqAx8y7_VouexqmnerZH1FFuozsHuK09AO5KGpHp-B_Gj6xxO1CBWOXvqgnFkdp5LsNokabUg.qLqFfOEH3f-VMb7_PxkVsg","token_type":"bearer","expires_in":3600}`;

// describe('QuickbooksService', function() {

//     it('should init success with fake integration object with current date update token', function(done) {
//         // Giving a current date for accessUpdated and refreshTokenUpdated will tell you that you are not expired
//         // on access token nor refresh token
//         qbService.init(fakeIntegrationObject)
//             .then(() => {
//                 // Just to check that the value got assigned
//                 assert.strictEqual(qbService.realmId, fakeIntegrationObject.realmId);
//                 done();
//             })
//             .catch(error => {
//                 console.log(error);
//                 done()
//             });
//     });

//     it('should return a refreshed token from Quickbooks server', function(done) {
//         // Giving a current date for accessUpdated and refreshTokenUpdated will tell you that you are not expired
//         // on access token nor refresh token
//         // const integrationObject = {
//         //     ...fakeIntegrationObject,
//         //     accessJson: realAccessJson,
//         //     accessUpdated: new Date(new Date().setDate(new Date().getDate() - 1)),
//         //     refreshTokenUpdated: new Date(new Date().setDate(new Date().getDate() - 10))
//         // }
//         // console.log('integrationObject', integrationObject);
//         qbService.init(/*integrationObject*/)
//             .then(() => {
//                 qbService.__getAccessToken().then(token => {
//                     console.log('__getAccessToken', token)
//                     assert.ok(token)
//                     done();
//                 })
//                 .catch(error => {
//                     console.log(error);
//                     done();
//                 })
                
//             })
//             .catch(error => {
//                 console.log(error);
//                 done()
//             });
//     });

//     it('should get some customer', function(done) {
//         this.timeout(10000);
//         qbService.init(/*integrationObject*/)
//             .then(() => {
//                 qbService.getCustomerById(59).then(result => {
//                     console.log('Customer', result);
//                     assert.ok(result);
//                     done();
//                 })
//                 .catch(error => {
//                     console.log(error);
//                     done();
//                 })
                
//             })
//             .catch(error => {
//                 console.log(error);
//                 done()
//             });
//     })

//     // it('should revoke quickbooks token', function(done) {
//     //     this.timeout(20000);
//     //     qbService.init()
//     //         .then(() => {
//     //             qbService.disconnect()
//     //                 .then((result) => {
//     //                     console.log('Disconnect successful', result)
//     //                     done()
//     //                 })
//     //                 .catch(error => {
//     //                     console.error('Error disconnecting', error)
//     //                     done()
//     //                 })
//     //         })
//     //         .catch((error) => {
//     //             console.log(error)
//     //             done()
//     //         })
//     // })
// });