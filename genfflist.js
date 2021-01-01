var shipdata = require("./kcSHIPDATA.js").shipdata;
var fflist = {'E1J': [393, 394, 619, 364, 658, 893], 'E2Q': [580, 393, 394, 619, 658, 179, 180, 630, 893], 'E3Z': [513, 393, 394, 395, 364, 400, 177, 179, 180, 147, 374, 375, 893, 639], 'E4W': [193, 194, 706, 578, 419, 229, 680, 689, 629, 569, 158, 702, 543], 'E4Z': [393, 394, 397, 144, 403, 659, 151, 545, 560, 689, 697, 318, 193, 706, 321, 705, 330, 599, 600, 606, 607, 610, 231, 488, 498, 629, 374, 375, 893, 639]}

output = {}

function fetch_all_remodels(shipid) {
    let result = [];
    let data = shipdata[shipid]
    let id = shipid;

    // Go below first
    while (true) {
        if (!data || data.name === "") break;
        result.push(id);
        id = data.prev;
        data = shipdata[id];
    }

    // Go above
    while (true) {
        if (!data || data.name === "") break;
        result.push(id);
        id = data.next;
        data = shipdata[id];
    }
    return result;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

for (let key in fflist) {
    let result = []
    const ffArray = fflist[key]
    for (let ffShipId of ffArray) {
        result.push(...fetch_all_remodels(ffShipId))
    }
    output[key] = result.filter(onlyUnique);
}
for (let key in output) {
    console.log(`var ${key}list = [${output[key]}]`)
}

