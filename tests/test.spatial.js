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
/*
asyncTest("Test basic spatial index: bounding box", 8, function() {

docs[i].loc = [i-20+docs[i].integer, i+15+docs[i].integer];
  var values = [
    { "type": "Point", "coordinates": [-20, 15] },
    { "type": "Point", "coordinates": [-19, 16] },
    { "type": "Point", "coordinates": [-18, 17] },
    { "type": "Point", "coordinates": [-17, 18] },
    { "type": "Point", "coordinates": [-16, 19] },
    { "type": "Point", "coordinates": [-15, 20] },
    { "type": "Point", "coordinates": [-14, 21] },
    { "type": "Point", "coordinates": [-13, 22] },
    { "type": "Point", "coordinates": [-12, 23] },
    { "type": "Point", "coordinates": [-11, 24] },
    { "type": "Point", "coordinates": [-10, 25] }
  ];

  initTestDB(this.name, function(err, db) {
    var docs = values.map(function(x, i) {
      return {_id: (i).toString(), geom: x};
    });
    db.bulkDocs({docs: docs}, {}, function() {
      var spatialFun = function(doc) { emit(doc.geom, doc.geom.type); };
      db.spatial(spatialFun, {bbox: [101, 1, 105, 5]}, function(_, res) {
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
*/



asyncTest("Test basic spatial index: bounding box", 8, function() {
  // When this number of tests was run, consider this aync test done
  var numTests = 2;

  var values = [
    { "type": "Point", "coordinates": [-20, 15] },
    { "type": "Point", "coordinates": [-18, 17] },
    { "type": "Point", "coordinates": [-16, 19] },
    { "type": "Point", "coordinates": [-14, 21] },
    { "type": "Point", "coordinates": [-12, 23] },
    { "type": "Point", "coordinates": [-10, 25] },
    { "type": "Point", "coordinates": [-8, 27] },
    { "type": "Point", "coordinates": [-6, 29] },
    { "type": "Point", "coordinates": [-4, 31] },
    { "type": "Point", "coordinates": [-2, 33] }
  ];

  var extractIds = function(rows) {
    return rows.map(function(row) {
      return row.id;
    }).sort();
  };

  initTestDB(this.name, function(err, db) {
    var docs = values.map(function(x, i) {
      return {_id: (i).toString(), geom: x};
    });
    db.bulkDocs({docs: docs}, {}, function() {
      var spatialFun = function(doc) { emit(doc.geom, doc.geom.type); };

      db.spatial(spatialFun, function(_, res) {
        same(['0','1','2','3','4','5','6','7','8','9'],
               extractIds(res.rows),
               'should return all geometries');
        numTests--;
      });

      db.spatial(spatialFun, {bbox: [-20, 0, 0, 20]}, function(_, res) {
        same(extractIds(res.rows), ['0','1','2'],
             'should return a subset of the geometries');
        numTests--;
      });

    });
  });

  var timer = window.setInterval(function() {
    if (numTests <= 0) {
      window.clearInterval(timer);
      start();
    }
  }, 500);

/*      
  bbox = [-20, 0, 0, 20];
  xhr = CouchDB.request("GET", url_pre + "basicIndex?bbox=" + bbox.join(","));
  TEquals(['0','1','2'], extract_ids(xhr.responseText),
          "should return a subset of the geometries");

  bbox = [0, 4, 180, 90];
  xhr = CouchDB.request("GET", url_pre + "basicIndex?bbox=" + bbox.join(","));
  TEquals("{\"rows\":[]}\n", xhr.responseText,
          "should return no geometries");

  bbox = [-18, 17, -14, 21];
  xhr = CouchDB.request("GET", url_pre + "basicIndex?bbox=" + bbox.join(","));
  TEquals(['1','2','3'], extract_ids(xhr.responseText),
          "should also return geometry at the bounds of the bbox");

  bbox = [-16, 19, -16, 19];
  xhr = CouchDB.request("GET", url_pre + "basicIndex?bbox=" + bbox.join(","));
  TEquals(['2'], extract_ids(xhr.responseText),
          "bbox collapsed to a point should return the geometries there");

  xhr = CouchDB.request("GET", url_pre + "basicIndex");
  TEquals(['0','1','2','3','4','5','6','7','8','9', 'stale1', 'stale2'],
          extract_ids(xhr.responseText),
          "no bounding box given should return all geometries");
      

*/
});
