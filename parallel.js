var width = document.body.clientWidth,
    height = d3.max([document.body.clientHeight-540, 240]);

var m = [60, 0, 10, 0],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2],
    xscale = d3.scale.ordinal().rangePoints([0, w], 1),
    yscale = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(1+height/50),
    data,
    foreground,
    background,
    highlighted,
    dimensions,
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = ["Baked Products","Beef Products","Beverages","Baby Foods","Cereal Grains and Pasta","Dairy and Egg Products","Ethnic Foods","Fast Foods","Finfish and Shellfish Products","Fruits and Fruit Juices","Lamb, Veal, and Game Products","Legumes and Legume Products","Meals, Entrees, and Sidedishes","Nut and Seed Products","Pork Products","Restaurant Foods","Sausages and Luncheon Meats","Snacks","Soups, Sauces, and Gravies","Spices and Herbs","Sweets"];

var colors = {
  "Baby Foods": [185,56,73],
  "Baked Products": [37,50,75],
  "Beef Products": [325,50,39],
  "Beverages": [10,28,67],
  "Breakfast Cereals": [271,39,57],
  "Cereal Grains and Pasta": [56,58,73],
  "Dairy and Egg Products": [28,100,52],
  "Ethnic Foods": [41,75,61],
  "Fast Foods": [60,86,61],
  "Fats and Oils": [30,100,73],
  "Finfish and Shellfish Products": [318,65,67],
  "Fruits and Fruit Juices": [274,30,76],
  "Lamb, Veal, and Game Products": [20,49,49],
  "Legumes and Legume Products": [334,80,84],
  "Meals, Entrees, and Sidedishes": [185,80,45],
  "Nut and Seed Products": [10,30,42],
  "Pork Products": [339,60,49],
  "Poultry Products": [359,69,49],
  "Restaurant Foods": [204,70,41],
  "Sausages and Luncheon Meats": [1,100,79],
  "Snacks": [189,57,75],
  "Soups, Sauces, and Gravies": [110,57,70],
  "Spices and Herbs": [214,55,79],
  "Sweets": [339,60,75],
  "Vegetables and Vegetable Products": [120,56,40]
};


d3.select("#chart")
    .style("height", (h + m[0] + m[2]) + "px")

d3.selectAll("canvas")
    .attr("width", w)
    .attr("height", h)
    .style("padding", m.join("px ") + "px");

foreground = document.getElementById('foreground').getContext('2d');
foreground.globalCompositeOperation = "destination-over";
foreground.strokeStyle = "rgba(0,100,160,0.1)";
foreground.lineWidth = 1.7;
foreground.fillText("Loading...",w/2,h/2);
highlighted = document.getElementById('highlight').getContext('2d');
highlighted.strokeStyle = "rgba(0,100,160,1)";
highlighted.lineWidth = 4;
background = document.getElementById('background').getContext('2d');
background.strokeStyle = "rgba(0,100,160,0.1)";
background.lineWidth = 1.7;

var svg = d3.select("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Load the Data
d3.csv("nutrients.csv", function(raw_data) {
  data = raw_data.map(function(d) {
    for (var k in d) {
      if (!_.isNaN(raw_data[0][k] - 0) && k != 'id') {
        d[k] = parseFloat(d[k]) || 0;
      }
    };
    return d;
  });

  xscale.domain(dimensions = d3.keys(data[0]).filter(function(k) {
    return (_.isNumber(data[0][k])) && (yscale[k] = d3.scale.linear()
      .domain(d3.extent(data, function(d) { return +d[k]; }))
      .range([h, 0]));
  }).sort());


  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xscale(d);
          this.__dragged__ = false;
          d3.select("#foreground").style("opacity", "0.35");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          xscale.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
          brush_count++;
          this.__dragged__ = true;

          if (dragging[d] < 8 || dragging[d] > w-8) {
            d3.select(this).select(".background").style("fill", "#b00");
          } else {
            d3.select(this).select(".background").style("fill", null);
          }
        })
        .on("dragend", function(d) {
          if (!this.__dragged__) {

          } else {
            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
            var extent = yscale[d].brush.extent();
          }
          if (dragging[d] < 8 || dragging[d] > w-8) {
            remove_axis(d,g);
          }
          xscale.domain(dimensions);
          update_ticks(d, extent);

          d3.select("#foreground").style("opacity", null);
          brush();
          delete this.__dragged__;
          delete this.__origin__;
          delete dragging[d];
        }))

  g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
      .attr("x", 0)
      .attr("class", "label")
      .text(String)
      .append("title")
        .text("Drag to reorder");

  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -23)
      .attr("width", 36)
      .append("title")
        .text("Drag up or down to brush along this axis");

  g.selectAll(".extent")
      .append("title")
        .text("Drag or resize this filter");
  legend = create_legend(colors,brush);
  brush();
});


function create_legend(colors,brush) {
  var legend_data = d3.select("#legend")
    .html("")
    .selectAll(".row")
    .data( _.keys(colors).sort() )

  var legend = legend_data
    .enter().append("div")

  legend
    .append("input")
    .attr("type", "checkbox")
    .attr("title", "Hide group")
    .attr("checked",function(d){
      if (!_.contains(excluded_groups, d)) {
        return "checked"
      }
    })
    .on("click", function(d) {
      if (_.contains(excluded_groups, d)) {
        d3.select(this).attr("title", "Hide group")
        excluded_groups = _.difference(excluded_groups,[d]);
        brush();
      } else {
        d3.select(this).attr("title", "Show group")
        excluded_groups.push(d);
        brush();
      }
    });
  legend
    .append("span")
    .style("background", function(d,i) { return color(d,0.85)})
    .attr("class", "color-bar");
  legend
    .append("span")
    .attr("class", "tally")
    .text(function(d,i) { return 0});
  legend
    .append("span")
    .text(function(d,i) { return " " + d});
  return legend;
}
function render_range(selection, i, max, opacity) {
  selection.slice(i,max).forEach(function(d) {
    path(d, foreground, color(d.group,opacity));
  });
};

function data_table(sample) {
  var sample = sample.sort(function(a,b) {
    var col = d3.keys(a)[0];
    return a[col] < b[col] ? -1 : 1;
  });
  var table = d3.select("#food-list")
    .html("")
    .selectAll(".row")
      .data(sample)
    .enter().append("div")
      .on("mouseover", highlight)
      .on("mouseout", unhighlight);
  table
    .append("span")
      .attr("class", "color-block")
      .style("background", function(d) { return color(d.group,0.85) })
  table
    .append("span")
      .text(function(d) { return d.name; })
}

function optimize(timer) {
  var delta = (new Date()).getTime() - timer;
  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
  render_speed = Math.min(render_speed, 300);
  return (new Date()).getTime();
}


function highlight(d) {
  d3.select("#foreground").style("opacity", "0.25");
  d3.selectAll(".row").style("opacity", function(p) { return (d.group == p) ? null : "0.3" });
  path(d, highlighted, color(d.group,1));
}

function unhighlight() {
  d3.select("#foreground").style("opacity", null);
  d3.selectAll(".row").style("opacity", null);
  highlighted.clearRect(0,0,w,h);
}

function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  ctx.beginPath();
  var x0 = xscale(0),
      y0 = yscale[dimensions[0]](d[dimensions[0]]);
  ctx.moveTo(x0,y0);
  dimensions.map(function(p,i) {
    var x = xscale(p),
        y = yscale[p](d[p]);
    var cp1x = x - 0.88*(x-x0);
    var cp1y = y0;
    var cp2x = x - 0.12*(x-x0);
    var cp2y = y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    x0 = x;
    y0 = y;
  });
  ctx.lineTo(x0, y0);
  ctx.stroke();
};

function color(d,a) {
  var c = colors[d];
  return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
}

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}

function brush() {
  brush_count++;
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });

  var b = d3.selectAll('.dimension')[0]
    .forEach(function(element, i) {
      var dimension = d3.select(element).data()[0];
      if (_.include(actives, dimension)) {
        var extent = extents[actives.indexOf(dimension)];
        d3.select(element)
          .selectAll('text')
          .style('font-weight', 'bold')
          .style('font-size', '13px')
          .style('display', function() {
            var value = d3.select(this).data();
            return extent[0] <= value && value <= extent[1] ? null : "none"
          });
      } else {
        d3.select(element)
          .selectAll('text')
          .style('font-size', null)
          .style('font-weight', null)
          .style('display', null);
      }
      d3.select(element)
        .selectAll('.label')
        .style('display', null);
    });
    ;

  d3.selectAll('.label')
    .style("font-weight", function(dimension) {
      if (_.include(actives, dimension)) return "bold";
      return null;
    });

  var selected = [];

  data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.group);
    })
    .map(function(d) {
      return actives.every(function(p, dimension) {
        return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
      }) ? selected.push(d) : null;
    });

  var query = d3.select("#search")[0][0].value;
  if (query.length > 0) {
    selected = search(selected, query);
  }


  var tallies = _(selected)
    .groupBy(function(d) { return d.group; })

  _(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });

  legend
    .attr("class", function(d) {
      return (tallies[d].length > 0)? "row": "row off";
    });

    legend.selectAll(".color-bar")
    .style("width", function(d) {
      return Math.ceil(600*tallies[d].length/data.length) + "px"
    });

  legend.selectAll(".tally")
    .text(function(d,i) { return tallies[d].length });

  // Render selected lines
  paths(selected, foreground, brush_count, true);
}

function paths(selected, ctx, count) {
  var n = selected.length,
      i = 0,
      opacity = .1,
      timer = (new Date()).getTime();
  shuffled_data = _.shuffle(selected);
  data_table(shuffled_data.slice(0,20));
  ctx.clearRect(0,0,w+1,h+1);
  function animloop(){
    if (i >= n || count < brush_count) return true;
    var max = d3.min([i+render_speed, n]);
    render_range(shuffled_data, i, max, opacity);
    i = max;
    timer = optimize(timer);
  };
  d3.timer(animloop);
}

function update_ticks(d, extent) {
  if (d) {
    var brush_el = d3.selectAll(".brush")
        .filter(function(key) { return key == d; });
    if (extent) {
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush));
    } else {
      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
    }
  } else {
    d3.selectAll(".brush")
      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
  }
  brush_count++;
  d3.selectAll(".axis")
    .each(function(d,i) {
      d3.select(this).selectAll('line').style("display", "none");
      d3.select(this)
        .transition()
        .duration(720)
        .call(axis.scale(yscale[d]));
      d3.select(this).selectAll('line').transition().delay(800).style("display", null);
      d3.select(this)
        .selectAll('text')
        .style('font-weight', null)
        .style('font-size', null)
        .style('display', null);
    });
}


function rescale() {
  dimensions.forEach(function(d,i) {
    if (yscale[d].inverted) {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([0, h]);
      yscale[d].inverted = true;
    } else {
      yscale[d] = d3.scale.linear()
          .domain(d3.extent(data, function(p) { return +p[d]; }))
          .range([h, 0]);
    }
  });
  update_ticks();
  paths(data, foreground, brush_count);
}

function actives() {
  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });
  var selected = [];
  data
    .filter(function(d) {
      return !_.contains(excluded_groups, d.group);
    })
    .map(function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? selected.push(d) : null;
  });
  var query = d3.select("#search")[0][0].value;
  if (query > 0) {
    selected = search(selected, query);
  }
  return selected;
}
function remove_axis(d,g) {
  dimensions = _.difference(dimensions, [d]);
  xscale.domain(dimensions);
  g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
  g.filter(function(p) { return p == d; }).remove();
  update_ticks();
}
d3.select("#search").on("keyup", brush);
function search(selection,str) {
  pattern = new RegExp(str,"i")
  return _(selection).filter(function(d) { return pattern.exec(d.name); });
}
