// 
var m = {'x': 0.001, 'y': 0.001},
    b = 0,
    alpha = 0.01;

// layout and display
var margin = {top: 50, right: 180, bottom: 50, left: 180},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#percep").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var y = d3.scale.linear()
        .domain([0, 10])
        .range([height, 0]);

var x = d3.scale.linear()
        .domain([0, 10])
        .range([0, width])

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

decision = svg.append("line")
    .attr("class", "line")
    .attr("x1", function(d){
        return x(0);
    })
    .attr("x2", function(d){
        return x(10);
    })
    .attr("y1", function(d){
        return y(-b / m.y);
    })
    .attr("y2", function(d){
        return y(((-m.x / m.y) * 10)  - (b / m.y));
    })
    .style("stroke", "black")
    .style("stroke-width", 1);

UpdateWeightInfo(m.x, m.y, b, alpha);

d3.json("PerceptronClassifier.json", function(error, data){

    dots = svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5.5)
        .attr("cx", function(d){
            return x(+d.x);
        })
        .attr("cy", function(d){
            return y(+d.y)
        })
        .style("fill", function(d){
            if (d.c == 1){
                return "#FECB2F";
            }
            else {
                return "#05358C";
            }
        })
        .style("stroke", function(d){
            var u = d.c * ((m.x * d.x) + (m.y * d.y) + b);
            if (u >= 0){
                return "white";
            }
            else{
                return "red";
                console.log(d.x, d.y, d.c);
            }
        })
        .style("stroke-width", 2);
});

function OfflineLearning(data, alpha){
    //Takes dataset and setpsize alpha
    var delta = [0, 0, 0];

    for (var i = 0; i < data.length; i++){
        var d = data[i];
        var u = d.c * ((m.x * d.x) + (m.y * d.y) + b);
        if ( u <= 0){
            delta[0] += (d.c - f) * d.x;
            delta[1] += (d.c - f) * d.y;
            delta[2] += (d.c - f);
        }
    }

    for (var i  = 0; i < delta; i ++){
        delta[i] /= data.length
    }

    m.x = m.x + alpha * delta[0];
    m.y = m.y + alpha * delta[1];
    b = b + alpha * delta[2];
    return [m, b];
}

function OnlineLearning(data, alpha, n){
    //Takes a dataset, a setpsize alpha, and a number of iterations to performs,
    //Otherwise far too slow to see effect
    for (var i = 0; i < n; i++){
        var d = data[Math.floor(Math.random() * data.length)];
        var u = (m.x * d.x) + (m.y * d.y) + b;
        if (d.c * u <= 0){
            m.x = m.x + alpha * d.c * d.x;
            m.y = m.y + alpha * d.c * d.y;
            b = b + alpha * d.c;
            }
        }
    return [m, b];
}

function UpdateWeightInfo(x_val,y_val,b_val,alpha_val){
    d3.select('#percep-desc').text(
        x_val.toFixed(5) + " x "
        + (y_val < 0 ? " - " + y_val.toFixed(5) * -1 : " + " + y_val.toFixed(5)) + " y "
        + (b_val < 0 ? " - " + b_val.toFixed(3) * -1 : " + " + b_val.toFixed(3))
        + " = 0"
    );
}

function UpdatePerceptron(){
    d3.json("PerceptronClassifier.json", function(error, data){
        ret = OnlineLearning(data, alpha, 10);
        m = ret[0];
        b = ret[1];
        decision.transition()
            .ease("linear")
            .attr("y1", function(d){
                return y(-b / m.y);
            })
            .attr("y2", function(d){
                return y(((-m.x / m.y) * 10) - (b / m.y));
            });
        dots.transition()
            .ease("linear")
            .style("stroke", function(d){
                var u = d.c * ((m.x * d.x) + (m.y * d.y) + b);
                if (u >= 0){
                    return "white";
                }
                else{
                    return "red";
                    console.log(d.x, d.y, d.c);
                }
            });
    });
    UpdateWeightInfo(m.x, m.y, b, alpha);
}