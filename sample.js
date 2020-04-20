const startCase = require("lodash/startCase");
const filter = require("lodash/filter");

const sample = {
    houseNo: '12',
    street: '12',
    landmark: 'abc',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '676565',
}


console.log(sample)

console.log(JSON.stringify(sample))

console.log(startCase("HelloWorldHello"))
console.log(startCase("helloWorldHello"))

console.log(filter(sample, function(val){
    console.log(val);
    return val=== '12'
}))