import json
input_file = json.load(open("./test.json", "r", encoding="utf-8"))

my_list = []
features = []

with open('./test.json', 'r', encoding='utf-8') as f:
    my_list = json.load(f)

    for idx, obj in enumerate(my_list):
        try:
            features.append({"type": "Feature", "geometry": {
                "type": "Point", "coordinates": [obj["location"]["lng"], obj["location"]["lat"]]}, "properties": obj["items"]})
        except KeyError:
            my_list.pop(idx)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

output_file = open("./geodata.geojson", "w", encoding="utf-8")
json.dump(geojson, output_file)

output_file.close()
