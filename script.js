const mapList = {
    "E1T": E1T,
    "E4Z3": E4Z3,
    "E6Z": E6Z,
    "E7Y": E7Y,
    "E7Z": E7Z
};
const filterList = {
    "E1T": e1tlist,
    "E4Z3": e4z3list,
    "E6Z": e6zlist,
    "E7Y": e7ylist,
    "E7Z": e7zlist
};

var lang = "en";

function sortArray(a, b) {
    if (b.count > a.count) return 1;
    else return -1;
}
var pad_array = function(arr,len,fill) {
    return arr.concat(Array(len).fill(fill)).slice(0,len);
}

function changeType(clicked) {
    lang = clicked.value;
    update()
}

function getBaseId(mid) {
    var ship = SHIPDATA[mid];
    while(ship) {
        if (!ship.prev) break;
        mid = ship.prev;
        ship = SHIPDATA[ship.prev];
    }
    return mid;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function update() {
    let nameToId = {};
    for (let id in id_tl.ships) {
        const shipname = id_tl.ships[id][lang];
        nameToId[shipname] = id;
    }
    const nameList = Object.keys(nameToId);
    var select = document.getElementById("map");
    const mapname = select.options[select.selectedIndex].value
    const map = mapList[mapname];
    var ships = document.getElementById("ships").value.split(/[ ,]+/);;

    const nameToSearch = ships.map(name => new RegExp(name, 'iu'))
    const shipsLeft = nameList.filter(name => nameToSearch.some(test => test.test(name)));
    let needList = shipsLeft.map(name => getBaseId(Number(nameToId[name]))).filter(onlyUnique);
    const shipsToFilter = filterList[mapname].filter(sid => !needList.includes(sid));
    if (ships.length == 1 && ships[0] == "") needList = [];
    const data = {};
    let total = 0;
    for (let i = 0; i < map.length; i++) {
        const entry = map[i];
        if ((needList.length == 0 || needList.every(shipid => entry.player.includes(shipid))) && !entry.player.some(shipid => shipsToFilter.includes(shipid))) {
            const ff = JSON.stringify(entry.ff);
            if (!data[ff]) data[ff] = 0;
            data[ff]++;
            total++;
        }
    }

    var table = document.getElementById("table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    const array = [];
    for (let ff in data) {
        array.push({
            ff: pad_array(JSON.parse(ff), 6, -1),
            count: data[ff]
        })
    }
    array.sort(sortArray);
    for (let i = 1; i <= array.length; i++) {
        var row = table.insertRow(i);
        var entry = array[i - 1];
        for (let k = 0; k < 6; k++) {
            var cell = row.insertCell(k);
            var ship = entry.ff[k];
            cell.innerHTML = ship == -1 ? "None" : id_tl.ships[ship][lang];
        }
        var cell = row.insertCell(6)
        cell.innerHTML = `${entry.count}/${total}, ${Math.floor(entry.count / total * 1000) / 10}%`;
    }
};
