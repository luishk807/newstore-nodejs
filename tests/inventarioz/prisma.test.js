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
// prisma.$on('query', e => {
//     e.query, console.log(e)
// });

// describe('Prisma', function() {
//     describe('Stock', function() {
//         it('stock entry prisma test', function(done) {
//             prisma.stock_entry.create({
//                 data: {
//                     product_id: 25,
//                     product_variant_id: 27,
//                     supplier_id: 1,
//                     stock_id: 3,
//                     // warehouse: { // Somehow this thing stopped working
//                     //     connectOrCreate: {
//                     //         where: {
//                     //             id: 1
//                     //         },
//                     //         create: {
//                     //             name: 'Main'
//                     //         }
//                     //     }
//                     // },
//                     // warehouse_id: -1,
//                     unit_cost: 1,
//                     unit_price: 2,
//                     // reference?: String | null,
//                     // expiration_date?: DateTime | null,
//                     purchase_date: new Date('2021-02-04T00:00:00.000Z'),
//                     quantity: 10,
//                     // supplier_invoice_ref?: String | null,
//                     // supplier_sku?: String | null,
//                     created_at: new Date('2021-02-06T04:49:54.913Z'),
//                     // warehouse_id: Int,
//                     // id?: Int,
//                     // warehouse_rack_id?: Int | null,
//                     // deleted?: Boolean
//                 },
//                 include: {
//                     warehouse: true
//                 }
//               }).then(result => {
//                 console.log(result);
//                 console.log('Error', result.error);
//                 done();
//                 assert.equal(result.length > 0, true)
//             }).catch(err => {
//                 console.log(err)
//                 done();
//             })
//         });

//         // it('should return something', function(done) {
//         //     const query = 'sony';
//         //     prisma.product.findMany({
//         //         // where: {
//         //         //     OR: [{
//         //         //         name: {
//         //         //                 contains: query,
//         //         //                 mode: "insensitive"
//         //         //             }
//         //         //         }, {
//         //         //         description: {
//         //         //                 contains: query,
//         //         //                 mode: "insensitive"
//         //         //             }
//         //         //         }
//         //         //     ]
//         //         // },
//         //         include: {
//         //             category_product: {
//         //                 include: {
//         //                     category: true
//         //                 }
//         //             },
//         //             brand_product: {
//         //                 include: {
//         //                     brand: true
//         //                     // brand: {
//         //                     //     select: {
                                    
//         //                     //     }
//         //                     // }
//         //                     // brand: {
//         //                     //     where: {
//         //                     //         name: {
//         //                     //             contains: query,
//         //                     //             mode: "insensitive"
//         //                     //         }
//         //                     //     }
//         //                     // }
//         //                 }
//         //             },
//         //             // category_product: {
//         //             //     where: {
//         //             //         category: {
//         //             //             name: {
//         //             //                 contains: query
//         //             //             }
//         //             //         }
//         //             //     }
//         //             // },
//         //             // department_product: {
//         //             //     where: {
//         //             //         department: {
//         //             //             name: {
//         //             //                 contains: query
//         //             //             }
//         //             //         }
//         //             //     }
//         //             // }
//         //         }
//         //     }).then(result => {
//         //         console.log(JSON.stringify(result));
//         //         done();
//         //     }).catch(err => {
//         //         console.log(err)
//         //         done();
//         //     })
//         // });
//     });
// });