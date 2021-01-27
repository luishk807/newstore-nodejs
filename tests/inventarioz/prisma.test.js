var assert = require('assert');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
    ],
})
prisma.$on('query', e => {
    e.query, console.log(e)
});

describe('Prisma', function() {
    describe('#search', function() {
        // it('simple search should return something', function(done) {
        //     const query = 'product';
        //     prisma.product.findMany({
        //         where: {
        //             OR: [{
        //                 name: {
        //                         contains: query,
        //                         mode: "insensitive"
        //                     }
        //                 }, {
        //                 description: {
        //                         contains: query,
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         }
        //     }).then(result => {
        //         console.log(result);
        //         done();
        //         assert.equal(result.length > 0, true)
        //     }).catch(err => {
        //         console.log(err)
        //         done();
        //     })
        // });

        it('should return something', function(done) {
            const query = 'sony';
            prisma.product.findMany({
                // where: {
                //     OR: [{
                //         name: {
                //                 contains: query,
                //                 mode: "insensitive"
                //             }
                //         }, {
                //         description: {
                //                 contains: query,
                //                 mode: "insensitive"
                //             }
                //         }
                //     ]
                // },
                include: {
                    category_product: {
                        include: {
                            category: true
                        }
                    },
                    brand_product: {
                        include: {
                            brand: true
                            // brand: {
                            //     select: {
                                    
                            //     }
                            // }
                            // brand: {
                            //     where: {
                            //         name: {
                            //             contains: query,
                            //             mode: "insensitive"
                            //         }
                            //     }
                            // }
                        }
                    },
                    // category_product: {
                    //     where: {
                    //         category: {
                    //             name: {
                    //                 contains: query
                    //             }
                    //         }
                    //     }
                    // },
                    // department_product: {
                    //     where: {
                    //         department: {
                    //             name: {
                    //                 contains: query
                    //             }
                    //         }
                    //     }
                    // }
                }
            }).then(result => {
                console.log(JSON.stringify(result));
                done();
            }).catch(err => {
                console.log(err)
                done();
            })
        });
    });
});