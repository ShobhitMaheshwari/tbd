
Data obtained from https://github.com/datameet/maps commit id 614d49b
Commands to create data

ogr2ogr -f GeoJSON subunits.json external/maps/States/Admin2.shp
topojson -o uk.json --id-property SU_A3 --properties name=NAME -- subunits.json
