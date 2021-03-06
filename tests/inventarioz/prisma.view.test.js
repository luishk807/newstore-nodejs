// var assert = require('assert');
// const { PrismaClient } = require('@prisma/client')
// const prisma = new PrismaClient({
//     log: [
//         {
//             emit: 'event',
//             level: 'query',
//         },
//     ],
// })

// describe('Prisma products view test', function() {
//     /** The view in manual.prisma should always be anually entered into schema.prisma after any change */
//     it('should return from manually added view model', function(done) {
//         prisma.view_product.findMany({})
//             .then(results => {
//                 console.log(results);
//                 done();
//             }).catch(err => {
//                 console.log(err);
//                 done();
//             })
//     });
// });