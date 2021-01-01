import os
import json

folder_name = "fall20"
file_list = os.listdir("./{}".format(folder_name))
output = {}

for filename in file_list:
    map_title = filename.split("_")[0]
    with open("./{}/{}".format(folder_name, filename)) as f:
        raw = f.read()
    data = json.loads(raw.split(" = ")[1])
    ship_list = set()
    for entry in data:
        for ship_id in entry["ff"]:
            ship_list.add(ship_id)
    output[map_title] = list(ship_list)

print(output)

