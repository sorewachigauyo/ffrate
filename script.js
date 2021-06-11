const event_name = "spring21"
var lang = "en";
const root = "https://raw.githubusercontent.com/sorewachigauyo/ffrate/master/"

let id_tl = {};
let tlLoaded = false;
let num = 0;
let ignoredfleet = [];
$.getJSON(root + "data/idTL.json" ,null, (data, status, xhr) => {
    id_tl = data;
    tlLoaded = true;
});

function create(options) {
    let button = $(`<button>${options.text}</button>`);
    button.on('click', options.callback);
    $('#container').append(button);
  }

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

function changeMap() {
    ignoredfleet = [];
    update();
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
    let nameToId = {};
    let nameList = [];
    for (let id in id_tl.ships) {
        const shipname = id_tl.ships[id][lang];
        nameToId[shipname] = id;
    }
    nameList = Object.keys(nameToId);
    const select = document.getElementById("map");
    const mtitle = select.options[select.selectedIndex].value;
    const mapdata = raw[mtitle];
    const ffArrays = mapdata.ff;
    //const shipsToFilter = [].concat.apply([], ignoredfleet.length == 0 ? ffArrays : ignoredfleet).filter(onlyUnique).filter(id => id > 0).map(id => getBaseId(id));
    //const fleetsToFilter = [].concat.apply([], ignoredfleet).filter(onlyUnique).filter(id => id > 0).map(id => getBaseId(id));
    const fleetsToFilter = ignoredfleet.map(fleet => fleet.filter(onlyUnique).filter(id => id > 0).map(id => getBaseId(id)));
    console.debug(fleetsToFilter);
    const allShips = [].concat.apply([], ffArrays).filter(onlyUnique).filter(id => id > 0).map(id => getBaseId(id));

    // FF that do not have target ship
    const data = {};
    ffArrays.forEach(array => data[JSON.stringify(array)] = 0);
    let total = 0
    mapdata.instances.forEach((array) => {
        const player = array[0];
        //if (shipsToInclude.every(shipid => player.includes(shipid)) && !player.some(ship => shipsToFilter.includes(ship))) {
        //if (player.some(ship => fleetsToFilter.every(fleet => fleet.includes(ship))) || (ignoredfleet.length == 0 && allShips.every(ship => !player.includes(ship)))) { 
        if (fleetsToFilter.every(fleet => player.some(ship => fleet.includes(ship))) || (ignoredfleet.length == 0 && allShips.every(ship => !player.includes(ship)))) { 
            //console.debug(player.some(ship => shipsToFilter.includes(ship)));)
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
        cell = row.insertCell(7);
        var btn = document.createElement('input');
        btn.type = "button";
        btn.className = "btn";
        btn.onclick = (function(entry) {return function() {ignoredfleet.push(entry.ff); update();}})(entry);
        cell.appendChild(btn);
    }

    var table = document.getElementById("table2");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    for (let i = 0; i < ignoredfleet.length; i++) {
        var row = table.insertRow(i + 1);
        var entry = ignoredfleet[i];
        for (let k = 0; k < 6; k++) {
            var cell = row.insertCell(k);
            var ship = entry[k];
            var img = document.createElement('img');
            if (ship > 0) {
                img.src = `icons/${SHIPDATA[ship].image}`;
            } else {
                img.src = "icons/Kblank.png"
            }
            cell.appendChild(img);
        }
        cell = row.insertCell(6);
        var btn = document.createElement('input');
        btn.type = "button";
        btn.className = "btn";
        btn.onclick = (function(idx) {return function() {ignoredfleet = ignoredfleet.filter((num, index) => index !== idx); update();}})(i);
        cell.appendChild(btn);
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
