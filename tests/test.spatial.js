module('spatial', {
  setup : function () {
    this.name = 'idb://test_suite_db';
  }
});

asyncTest("Test basic spatial index", 8, function() {

  // some geometries are based on the GeoJSON specification
  // http://geojson.org/geojson-spec.html (2010-08-17)
  var values = [
    { "type": "Point", "coordinates": [100.0, 0.0] },
    { "type": "LineString", "coordinates":[
      [100.0, 0.0], [101.0, 1.0]
      ]},
    { "type": "Polygon", "coordinates": [
      [ [100.0, 0.0], [101.0, 0.0], [100.0, 1.0], [100.0, 0.0] ]
      ]},
    { "type": "Polygon", "coordinates": [
      [ [100.0, 0.0], [101.0, 0.0], [100.0, 1.0], [100.0, 0.0] ],
      [ [100.2, 0.2], [100.6, 0.2], [100.2, 0.6], [100.2, 0.2] ]
    ]},
    { "type": "MultiPoint", "coordinates": [
      [100.0, 0.0], [101.0, 1.0]
    ]},
    { "type": "MultiLineString", "coordinates": [
      [ [100.0, 0.0], [101.0, 1.0] ],
      [ [102.0, 2.0], [103.0, 3.0] ]
    ]},
    { "type": "MultiPolygon", "coordinates": [
      [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
      [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
        [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
      ]
    ]},
    { "type": "GeometryCollection", "geometries": [
      { "type": "Point", "coordinates": [100.0, 0.0] },
      { "type": "LineString", "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]}
    ]}
  ];

  initTestDB(this.name, function(err, db) {
    var docs = values.map(function(x, i) {
      return {_id: (i).toString(), geom: x};
    });
    db.bulkDocs({docs: docs}, {}, function() {
      var spatialFun = function(doc) { emit(doc.geom, doc.geom.type); };
      db.spatial(spatialFun, function(_, res) {
        res.rows.forEach(function(x, i) {
          //ok(JSON.stringify(x.geometry) === JSON.stringify(values[i]),
          equals(JSON.stringify(x.geometry), JSON.stringify(values[i]),
             'geometries were returned correctly');
        });
        start();
      });
    });
  });

});
