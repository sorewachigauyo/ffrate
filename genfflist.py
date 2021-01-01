import os
import json

folder_name = "fall20"
file_list = os.listdir("./{}".format(folder_name))
output = {}

for filename in file_list:
    map_title = filename.split("_")[0]
    if filename == "fflist.js":
        continue
    with open("./{}/{}".format(folder_name, filename)) as f:
        raw = f.read()
    data = json.loads(raw.split(" = ")[1])
    ff_list = set()
    for entry in data:
        ff_list.add(tuple(entry["ff"]))
        #for ship_id in entry["ff"]:
            #ship_list.add(ship_id)
    output[map_title] = list([list(array) for array in ff_list])

print(output)
