const moment     = require('moment');

function timeCalcuation(starttime, endtime) {
    
	let start = moment.utc(starttime, "HH:mm");
let end = moment.utc(endtime, "HH:mm");

// account for crossing over to midnight the next day
// if (end.isBefore(start)) {
//     return "lll";
// }
//let u = (end.isBefore(start))?1:0;
return end.isBefore(start);

// // calculate the duration
// let d = moment.duration(end.diff(start));



// // format a string result
// let s = moment.utc(+d).format('H:mm');
// return s;
}

module.exports.getDiffTime = timeCalcuation;