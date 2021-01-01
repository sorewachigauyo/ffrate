var shipdata = require("./kcSHIPDATA.js").shipdata;
var fflist = {'E1J': [[364, 893, 394], [619, 658], [393, 893, 394], [893, 394]], 'E2Q': [[630, 893, 394], [893, 394], [393, 893, 394], [], [394, 893], [630, 179, 180], [619, 658], [580, 619]], 'E3Z': [[639, 400, 374, 375], [393, 364, 893, 394], [513, 395, 147, 393, 893, 394], [177, 179, 180, 513, 395], [513, 893, 394, 395]], 'E4W': [[702, 706], [158, 193, 194, 706], [706, 702, 419], [158, 193, 194, 229, 706], [706, 702, 569, 680, 689, 629], [706, 543, 569, 680], [706, 702, 578], [158, 689, 629, 706]], 'E4Z': [[639, 607, 374, 375, 193, 706], [639, 607, 374, 375, 606, 403], [659, 697, 393, 705, 893, 394], [318, 560, 488, 330, 498, 144], [599, 610, 151, 321, 231, 706], [599, 610, 397, 545, 689, 629], [659, 600, 393, 705, 893, 394]]}

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

function getBaseId(mid) {
    var ship = shipdata[mid];
    while(ship) {
        if (!ship.prev) break;
        mid = ship.prev;
        ship = shipdata[ship.prev];
    }
    return mid;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

for (let key in fflist) {
    let result = []
    const ffArray = fflist[key]
    
    result = ffArray.map(array => array.map(mid => getBaseId(mid)));
    output[key] = result;
}
for (let key in output) {
    console.log(`var ${key}list = `)
    console.log(output[key])
}

