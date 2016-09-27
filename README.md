
Shape Data obtained from https://github.com/datameet/maps commit id 614d49b
Population data obtained from Wikipedia (https://en.wikipedia.org/wiki/List_of_states_and_union_territories_of_India_by_population) census data of 2011.

Commands to create data

ogr2ogr -f GeoJSON subunits.json external/maps/States/Admin2.shp
topojson -o uk.json --id-property SU_A3 --properties name=ST_NM -- subunits.json
