const mapList = {
    "E1J": E1J,
    "E2Q": E2Q,
    "E3Z": E3Z,
    "E4W": E4W,
    "E4Z": E4Z
};
const filterList = {
    "E1J": E1Jlist,
    "E2Q": E2Qlist,
    "E3Z": E3Zlist,
    "E4W": E4Wlist,
    "E4Z": E4Zlist
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

    const namesToSearch = ships.map(name => new RegExp(name, 'iu'));
    const shipsMatchingName = nameList.filter(name => namesToSearch.some(test => test.test(name)));
    let shipsToInclude = shipsMatchingName.map(name => getBaseId(Number(nameToId[name]))).filter(onlyUnique);
    if (ships.length == 1 && ships[0] == "") shipsToInclude = [];
    const filteredFFArrays = filterList[mapname].filter(ffArray => ffArray.every(ffship => !shipsToInclude.includes(ffship)));
    const shipsToFilter = [].concat.apply([], filteredFFArrays).filter(onlyUnique);
    const data = {};
    let total = 0;
    for (let i = 0; i < map.length; i++) {
        const entry = map[i];
        if ((shipsToInclude.length == 0 || shipsToInclude.every(shipid => entry.player.includes(shipid))) && !entry.player.some(shipid => shipsToFilter.includes(shipid))
    ) {
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
            var img = document.createElement('img');
            if (ship > 0) {
                img.src = `icons/${SHIPDATA[ship].image}`;
            } else {
                img.src = "icons/Kblank.png"
            }
            cell.appendChild(img);
        }
        var cell = row.insertCell(6)
        cell.innerHTML = `${entry.count}/${total}, ${Math.floor(entry.count / total * 1000) / 10}%`;
    }
};
