const startCase = require("lodash/startCase");
const filter = require("lodash/filter");
const omit = require("lodash/omit");

const sample = {
    fullName: "Rachel Roy",
    mobileNo: "9998787656",
    houseNo: '12',
    street: '12',
    landmark: 'abc',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '676565',
}

const sample2 = {
    shippingName: "Rachel Roy",
    shippingAddress1: "12 12 abc",
    shippingAddress2: "",
    shippingCity: "Kochi",
    shippingZip: "676565",
    shippingState: "Kerala",
    shippingCountry: "India",
    shippingPhone: "9998787656",
    shippingEmail: "rachel@gmail.com",
}

const a = [{id:1}, {id:2,qty:2}];
console.log(JSON.stringify(a))

const b = omit(sample, ['fullName']);
console.log('hii',b,sample )
console.log('hiib',b,sample )



console.log(JSON.stringify(sample2))

console.log(startCase("HelloWorldHello"))
console.log(startCase("helloWorldHello"))

console.log(filter(sample, function (val) {
    console.log(val);
    return val === '12'
}))