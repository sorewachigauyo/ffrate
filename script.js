const event_name = "spring21"
var lang = "en";
const root = "https://raw.githubusercontent.com/sorewachigauyo/ffrate/master/"

let id_tl = {};
let nameToId = {};
let nameList = [];
let tlLoaded = false;
let num = 0;
$.getJSON(root + "data/idTL.json" ,null, (data, status, xhr) => {
    id_tl = data;
    for (let id in id_tl.ships) {
        const shipname = id_tl.ships[id][lang];
        nameToId[shipname] = id;
    }
    nameList = Object.keys(nameToId);
    tlLoaded = true;
});

const raw = {
    "E1Q": null,
    "E1V": null,
    "E4Z": null,
    "E5V": null,
    "E5Z": null
}
for (let key in raw) {
    $.getJSON(root + `${event_name}/${key}.json`, null, (data, status, xhr) => {
        raw[key] = {
            ff: null,
            instances: data
        };
        const obj = {}
        for (let array of data) {
            const enemy = array[1];
            obj[JSON.stringify(enemy)] = null;
        }
        raw[key].ff = Object.keys(obj).map(a => JSON.parse(a));
    });
}


const filterer = a => a > 0
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
    if (Object.keys(id_tl).length == 0) {
        return;
    }
    const shipNamesToFilter = document.getElementById("ships").value.split(/[ ,]+/);;
    const namesToSearch = shipNamesToFilter.map(name => new RegExp(name, 'iu'));
    const shipsMatchingName = nameList.filter(name => namesToSearch.some(test => test.test(name)));
    let shipsToInclude = shipsMatchingName.map(name => getBaseId(Number(nameToId[name]))).filter(onlyUnique);
    if (ships.length == 1 && ships[0] == "") shipsToInclude = [];

    const select = document.getElementById("map");
    const mtitle = select.options[select.selectedIndex].value;
    const mapdata = raw[mtitle]

    // FF that do not have target ship
    const filteredFFArrays = mapdata.ff.filter(ffArray => ffArray.every(ffship => !shipsToInclude.includes(getBaseId(ffship))));
    // For fair comparison, player fleet should not block any other FF
    const shipsToFilter = [].concat.apply([], filteredFFArrays).filter(onlyUnique);

    const data = {};
    filteredFFArrays.forEach(array => data[JSON.stringify(array)] = 0);
    let total = 0
    mapdata.instances.forEach((array) => {
        const player = array[0];
        if (shipsToInclude.every(shipid => player.includes(shipid)) && !player.some(ship => shipsToFilter.includes(ship))) {
            total++;
            data[JSON.stringify(array[1])] += 1;
        }
    });

    var table = document.getElementById("table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    const array = [];
    for (let ff in data) {
        array.push({
            ff: pad_array(JSON.parse(ff), 6, -1),
            count: data[ff] || 0
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
        cell.innerHTML = `${entry.count}/${total}, ${Math.floor(entry.count / total * 1000) / 10 || 0}%`;
    }
}

function onReady() {
    if (tlLoaded && Object.keys(raw).every(mtitle => raw[mtitle] !== null)) {
        $("ships").show();
        update();
    } else {
        $("ships").hide();
        setTimeout(onReady, 1000);
    }
}
