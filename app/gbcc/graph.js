
var applet1;
Graph = (function() {
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  var boundaries;
  var points = {};
  var graphLoaded = false;
  
  ////// SETUP MAP //////

  function setupInterface() {
    if ($("#graphContainer").length === 0) {
      viewWidth = parseFloat($(".netlogo-canvas").css("width"));
      viewHeight = parseFloat($(".netlogo-canvas").css("height"));
      spanText =    "<div id='graphContainer'></div>";
      $(".netlogo-widget-container").append(spanText);
      $("#graphContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 1 + "px");
      $("#graphContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 1 + "px");
      $("#graphContainer").css("left", $(".netlogo-view-container").css("left"));
      $("#graphContainer").css("top", $(".netlogo-view-container").css("top"));
      $("#graphContainer").css("display", "none");
      $(".netlogo-view-container").css("pointer-events","none");
      //applet1 = new GGBApplet({filename: "geogebra-default.ggb", "appletOnLoad": appletOnLoadVisible}, true);
      applet1 = new GGBApplet({filename: "geogebra-default.ggb"}, true);
      applet1.inject('graphContainer');
      setupEventListeners();
    }
  }
  
  function appletOnLoadVisible() {
    setTimeout(function(){ 
      updateGraph(); 
      $("#graphContainer").css("display","inline-block");
      $(".netlogo-view-container").css("z-index","1");
      ggbApplet.setErrorDialogsActive(false);  
    }, 1000);
  }
  
  function setupEventListeners() {
    $(".netlogo-view-container").css("background-color","transparent");   
  }
  
  ////// DISPLAY GRAPH //////
  
  function updateGraph() {
    if (ggbApplet) {
      
      ggbApplet.setWidth(parseInt($("#graphContainer").css("width")) + Math.random(1));
      ggbApplet.setHeight(parseInt($("#graphContainer").css("height")) + Math.random(1));//+ viewHeight + Math.random(1)); 
      $("#opacityWrapper").css("top",parseInt($("#graphContainer").css("top")) - 18 + "px");
      $("#opacityWrapper").css("left",$("#graphContainer").css("left"));
      var properties = JSON.parse(ggbApplet.getViewProperties());
      graphWidth = properties.width;
      graphHeight = properties.height;
      //graphWidth = parseInt($("#graphContainer").css("width"));
      //graphHeight = parseInt($("#graphContainer").css("height"));
      viewOffsetWidth = viewWidth - graphWidth;
      viewOffsetHeight = viewHeight - graphHeight;
      var xMin = properties.xMin;
      var yMin = properties.yMin;;    
      var xScale = properties.invXscale;
      var yScale = properties.invYscale;
      var xMax = graphWidth * xScale + xMin; // how many sections there are  
      var yMax = graphHeight * yScale + yMin;
      boundaries = {xmin: xMin, xmax: xMax, ymin: yMin, ymax: yMax};
      graphLoaded = true;
      //var newWidth = viewWidth + Math.random(1);
      //var newHeight = viewHeight + Math.random(1);
      //ggbApplet.setWidth(newWidth);
      //ggbApplet.setHeight(newHeight); 

    }
  }
  
  ////// COORDINATE CONVERSION //////

  function patchToGraph(coords) {
    if (graphLoaded) {
      var xcor = coords[0];
      var ycor = coords[1];
      var pixelX = universe.view.xPcorToPix(xcor);
      var pixelY = universe.view.yPcorToPix(ycor);
      pixelX -= (viewOffsetWidth );
      pixelY -= (viewOffsetHeight );
      var pixelPercentX = (pixelX / (graphWidth));
      var pixelPercentY = 1 - (pixelY / (graphHeight));
      var boundaryMinX = boundaries.xmin;
      var boundaryMinY = boundaries.ymin;
      var boundaryMaxX = boundaries.xmax;
      var boundaryMaxY = boundaries.ymax;
      var pointX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
      var pointY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
      return [pointX, pointY];
    } else { return [ 0, 0 ]}
  }
  
  function graphToPatch(coords) {
    if (graphLoaded) {
      var pointPositionX = coords[0];
      var pointPositionY = coords[1];
      var boundaryMinX = boundaries.xmin;
      var boundaryMinY = boundaries.ymin;
      var boundaryMaxX = boundaries.xmax;
      var boundaryMaxY = boundaries.ymax;
      if ( pointPositionX < boundaryMinX 
        || pointPositionX > boundaryMaxX
        || pointPositionY < boundaryMinY
        || pointPositionY > boundaryMaxY) {
        return (["out of bounds", "out of bounds"]);
      }
      var pointPercentX = 1 - ((boundaryMaxX - pointPositionX) / (boundaryMaxX - boundaryMinX));
      var pointPercentY = (boundaryMaxY - pointPositionY) / (boundaryMaxY - boundaryMinY);
      var pixelX = pointPercentX * graphWidth;
      var pixelY = pointPercentY * graphHeight;
      pixelX += viewOffsetWidth;//(viewOffsetWidth / 2);    
      pixelY += viewOffsetHeight;//(viewOffsetHeight / 2);
      var patchXcor = universe.view.xPixToPcor(pixelX);
      var patchYcor = universe.view.yPixToPcor(pixelY);
      return ([patchXcor, patchYcor]);
    } else { return [ 0, 0 ]}
  }
  
  
  ////// SHOW AND HIDE GRAPH //////
  
  function showGraph() {
    if (!applet1) 
    {
      $("#graphContainer").css("display","none");
      importGgb("geogebra-default.ggb");
    } else { 
      $("#graphContainer").css("display","inline-block");
      $(".netlogo-view-container").css("z-index","1");
      world.triggerUpdate();

    }
    $("#graphContainer").css("display","inline-block");
    $(".netlogo-view-container").css("pointer-events","none");
    $("#opacityWrapper").css("top",parseInt($("#graphContainer").css("top") - 15) + "px");
    $("#opacityWrapper").css("left",$("#graphContainer").css("left"));
    $("#opacityWrapper").css("display", "inline-block");
    drawPatches = false;
    updateGraph();
    world.triggerUpdate();
  }
  
  function hideGraph() {
    $("#graphContainer").css("display","none");
    $(".netlogo-view-container").css("z-index","0");
    $(".netlogo-view-container").css("pointer-events","auto");
    $("#opacityWrapper").css("display", "none");
    drawPatches = true;
    world.triggerUpdate();
  }

  ///////// GRAPH SETTINGS  ///////
  
  ///////// IMPORT GGB ///////
  
  function importGgb(filename) { 
    //drawPatches = true;
    //universe.repaint();
    if ($("#graphContainer").css("display") === "none") { showGraph(); }
    //$("#graphContainer").css("display","inline-block");
    applet1 = new GGBApplet({filename: filename,"showToolbar":true, "appletOnLoad": appletOnLoadVisible}, true);
    applet1.inject('graphContainer');
  }
  
  //////// POINTS /////////
  
  function createPoint(name, coords) {
    console.log("create point",name,coords);
    var x = coords[0];
    var y = coords[1];
    ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
  }
  
  function createPoints(points) {
    var point;
    for (var i=0; i<points.length; i++) {
      point = points[i];
      createPoint(point[0], point[1]);
    }
  }
  
  function getPoint(name) {
    return exists(name) ? [name, getXy(name)] : [ "undefined", [ 0,0] ];
  }
  
  function getPoints() {
    var pointList = [];
    var objectNames = ggbApplet.getAllObjectNames();
    var name;
    var x, y;
    for (var i=0; i<objectNames.length; i++) {
      name = objectNames[i];
      if (getObjectType(name) === "point") {
        pointList.push(getPoint(name));
      }
    }
    return pointList;
  }
  
  function deletePoint(name) {
    if (exists(name)) { ggbApplet.deleteObject(name); }
  }

  function deletePoints() {
    var points = getPoints();
    for (var i=0; i<points.length; i++) {
      deletePoint(points[i][0]);
    }
  }

  /////// POINT ATTRIBUTES ////////
  
  function setX(name, x) {
    var y = ggbApplet.getYcoord(name);
    if (ggbApplet.exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function setY(name, y) {
    var x = ggbApplet.getXcoord(name);
    if (ggbApplet.exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function setXy(name, coords) {
    var x = coords[0];
    var y = coords[1];
    if (ggbApplet.exists(name)) {
      ggbApplet.setCoords(name, x, y);
    } else {
      ggbApplet.evalCommand(name + " = ("+x+", "+y+")");
    }
  }
  
  function getX(name) {
    return exists(name) ? ggbApplet.getXcoord(name) : 0;
  }
  
  function getY(name) {
    return exists(name) ? ggbApplet.getYcoord(name) : 0;
  }
  
  function getXy(name) {
    return exists(name) ? [ggbApplet.getXcoord(name), ggbApplet.getYcoord(name)] : [ 0, 0];
  }
  
  /////// OBJECTS ////////
  
  function getObjects() {
    var objectList = [];
    var objectNames = ggbApplet.getAllObjectNames();
    var name;
    var value;
    for (var i=0; i<objectNames.length; i++) {
      name = objectNames[i];
      
      value = getObject(objectNames[i]);
      objectList.push(value)
    }
    return objectList;
  }
  
  function getObject(name) {
    var result = {};
    var objectType = ggbApplet.getObjectType(name);    
    var valueTypes = [ "numeric", "text", "boolean" ];
    var commandTypes = [  ];
    var valueString = ggbApplet.getValueString(name);
    var commandString = ggbApplet.getCommandString(name);
      result.command = commandString ? commandString : valueString; 
      
    if (result.command.indexOf("=") < 0) {
      result.command = name + " = " + result.command;
      //console.log(name);
      //console.log(ggbApplet.getObjectType(name));
      //try {
      //  result.xcoord = ggbApplet.getXcoord(name);
      //  result.ycoord = ggbApplet.getYcoord(name);
    //} catch {
        
      //}
    } 
    //console.log(name+" '"+ result.command + "'");
    result.color = ggbApplet.getColor(name); 
    result.lineStyle = ggbApplet.getLineStyle(name); 
    result.lineThickness = ggbApplet.getLineThickness(name);
    result.pointSize = ggbApplet.getPointSize(name);
    result.pointStyle = ggbApplet.getPointStyle(name); 
    result.visible = ggbApplet.getVisible(name);
    result.filling = ggbApplet.getFilling(name);
    result.labelVisible = ggbApplet.getLabelVisible(name);

    if (objectType === "numeric" || objectType === "boolean" || objectType === "text") { result.visible = false; }
    var resultString = JSON.stringify(result);
    return [ name, resultString ];  
  }
  
  function createObjects(objects) {
    console.log("create objects")
    for (var i=0; i<objects.length; i++) {
      createObject(objects[i]);
    }
  }
  
  function hexToRgb(hex) {
    hex = hex.replace("#","");
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r, g, b];
}
  
  function createObject(objectList) {
    var name = objectList[0];
    var result = JSON.parse(objectList[1]);
    //deleteObject(name);
    evalCommand(result.command);
    var color = hexToRgb(result.color);
    ggbApplet.setColor(name, color[0], color[1], color[2]);  
    ggbApplet.setLineStyle(name, result.lineStyle);  
    ggbApplet.setLineThickness(name, result.lineThickness);  
    ggbApplet.setPointSize(name, result.pointSize);  
    ggbApplet.setPointStyle(name, result.pointStyle);  
    ggbApplet.setVisible(name, result.visible);
    ggbApplet.setFilling(name, result.filling);
    ggbApplet.setLabelVisible(name, result.labelVisible);
    //if (result.xcoord && result.ycoord) { 
    //  ggbApplet.setCoords(name, result.xcoord, result.ycoord, 0); 
    //}
  }
  
  function renameObject(name1, name2) {
    if (exists(name1)) { ggbApplet.renameObject(name1, name2); }
  }
  
  function deleteObject(name) {
    if (exists(name)) { ggbApplet.deleteObject(name); }
  }
  
  function deleteObjects() {
    var objects = ggbApplet.getAllObjectNames();
    for (var i=0; i<objects.length; i++) {
      ggbApplet.deleteObject(objects[i]);
    }
  }
  
  //////// SHOW AND HIDE ///////
  
  function hideObject(name) {
    if (exists(name)) { ggbApplet.setVisible(name, false); }
  }

  function showObject(name) {
    if (exists(name)) { ggbApplet.setVisible(name, true); }
  }
  
  /////// OBJECT ATTRIBUTES ///////
  
  function getValue(arg) {
    var value = ggbApplet.getValue(arg);
    return (value || value === 0) ? value : "undefined";
  }
  
  function getObjectType(name) {
    return (exists(name)) ? ggbApplet.getObjectType(name) : "undefined";
  }
  
  function exists(name) {
    return (ggbApplet) ? ggbApplet.exists(name) : false;
  }
  
  /////// GEOGEBRA EVAL ///////
  
  function evalCommand(cmdString) {
    console.log("evalCommand '"+cmdString+"'");
    try {
        if (graphLoaded) { 
          ggbApplet.evalCommand(cmdString) 
        } else {
          console.log("cannot evalCommand")
        };
      //}
    } catch (ex) {
      console.log("cannot evalCommand")
    }
  }
  
  function evalReporter(string) {
    return "0";
  }
  
  function getAll() {
    return ggbApplet.getXML();
  }
  
  function setAll(xmlString) {
    ggbApplet.setXML(xmlString);
  }
  
  function showToolbar() {
    ggbApplet.showToolBar(true);
  }
  
  function hideToolbar() {
    ggbApplet.showToolBar(false);
  }
  
  function bringToFront() {
    $("#graphContainer").css("z-index","3");
  }
  
  function sendToBack() {
    $("#graphContainer").css("z-index","0"); 
  }
  
  function setOpacity(value) {
    $("#graphContainer").css("opacity", value);
    $("#opacity").val(value * 100);
  }
  
  function getOpacity() {
    return parseFloat($("#graphContainer").css("opacity"));
  }
  
  function showObjectLabel(name) {
    ggbApplet.setLabelVisible(name, true);
  }
  
  function hideObjectLabel(name) {
    ggbApplet.setLabelVisible(name, false);
  }
  
  function setGraphOffset(offset) {
    var top = offset[1] + "px";
    var left = offset[0] + "px";
    $("#graphContainer").css("top", top);
    $("#graphContainer").css("left", left);   
    if (offset.length === 4) {
      ggbApplet.setWidth(width);
      ggbApplet.setHeight(height);
      var height = offset[3] + "px";
      var width = offset[2] + "px";
      $("#graphContainer").css("height", height);
      $("#graphContainer").css("width", width);   
    }
    updateGraph();
  }
  function getGraphOffset() {
    var top = parseInt($("#graphContainer").css("top"));
    var left = parseInt($("#graphContainer").css("left"));
    var height = parseInt($("#graphContainer").css("height"));
    var width = parseInt($("#graphContainer").css("width"));   
    return [ left, top, width, height ]
  }
  
  function centerView(center) {
    var x = center[0];
    var y = center[1];
    ggbApplet.evalCommand("CenterView(( " + x + ", " + y + " ))");
  }
  
  return {
    setupInterface: setupInterface,
    hideGraph: hideGraph,
    showGraph: showGraph,
    createPoint: createPoint,
    createPoints: createPoints,
    getPoints: getPoints,
    setX: setX,
    setY: setY,
    setXy: setXy,
    getX: getX,
    getY: getY,
    getXy: getXy,    
    getObjects: getObjects,
    createObjects: createObjects,
    getValue: getValue,
    getObjectType: getObjectType,
    renameObject: renameObject,
    deleteObject: deleteObject,
    hideObject: hideObject,
    showObject: showObject, 
    graphToPatch: graphToPatch,
    patchToGraph: patchToGraph,
    evalCommand: evalCommand,
    evalReporter: evalReporter,
    importGgb: importGgb,
    objectExists: exists,
    getObject: getObject,
    updateGraph: updateGraph,
    deleteObjects: deleteObjects,
    getAll: getAll,
    setAll: setAll,
    showToolbar: showToolbar,
    hideToolbar: hideToolbar,
    showObjectLabel: showObjectLabel,
    hideObjectLabel: hideObjectLabel,
    bringToFront: bringToFront,
    sendToBack: sendToBack,
    setOpacity: setOpacity,
    getOpacity: getOpacity,
    showObjectLabel: showObjectLabel,
    hideObjectLabel: hideObjectLabel,
    setGraphOffset: setGraphOffset,
    getGraphOffset: getGraphOffset,
    deletePoints: deletePoints,
    deletePoint: deletePoint,
    getPoint: getPoint,
    centerView: centerView
  };
 
})();

