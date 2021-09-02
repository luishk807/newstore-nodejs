function misterOrMiss(number) {
    switch (number) {
        case 1:
            return 'Mr.'
        case 2:
            return 'Mrs.'
        default:
            return ''
    }
}

function convertUserToCustomer(user, id) {
    /**
     * Quickbooks does not allow people with same name, so we need to add something
     * unique
     */
    const customer = {
        DisplayName: `${user.first_name} ${user.last_name} (${(id) ? id : user.id})`, //
        Suffix: '', //
        Title: misterOrMiss(user.gender), //
        GivenName: user.first_name, //
        MiddleName: '', //
        FamilyName: user.last_name,
        PrimaryEmailAddr: {
            Address: user.email
        },
        PrimaryPhone: {
            FreeFormNumber: user.phone
        },
        Mobile: {
            FreeFormNumber: user.mobile
        },
        Notes: JSON.stringify({ id: user.id })
    }
    return customer;
}

module.exports = {
    convertUserToCustomer
}
