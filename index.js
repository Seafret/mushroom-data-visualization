/* CPSC 583 Final Project
*  Jessica Rogi (10140223)
*       Citations:
*           - Much of the basic set up for this project was taught in tutorial by
*             CPSC 583 (Fall 2020) TA Nathan, and I have used and adapted this set
*             up as a starting point for my project.
*           - Because we primarily focused on bar charts in tutorials, I used the
*             following resources to help me understand how to build a parallel
*             coordinates visualization since I have no prior experience with
*             any of this stuff (I will specifically cite specific code blocks where
*             I utilized code from these sources):
*               > https://www.d3-graph-gallery.com/graph/parallel_basic.html
*               > https://www.d3-graph-gallery.com/graph/parallel_custom.html
*               > https://github.com/kalealex/parallel-coordinates-d3v5/blob/master/working/parallel-coodinates.js
*               > https://bl.ocks.org/jasondavies/1341281
*           - I also used the following as learning resources:
*               > https://www.w3schools.com/
*               > https://www.d3indepth.com/scales/
*               > https://observablehq.com/@d3/d3v6-migration-guide
*               > https://developer.mozilla.org/en-US/
*           - The emoji images used are open-source emojis from https://twemoji.twitter.com/
*             and I drew the cap shape images myself using pixel art tool aesprite
*/


// Citation: basic formatting from TA Nathan's tutorials
var margins = {top: 20, right: 20, bottom: 60, left: 60};
var innerWidth = 1600 - margins.left - margins.right;
var innerHeight = 900 - margins.top - margins.bottom;

var xScale,
    yScale = [],
    yDomain = [];

// Citaion: start and basic format for interactive visualization from TA Nathan's tutorials
function interact() {
    let chart = d3.select("#interact");
    makeInnerArea(chart);

    let promise = d3.csv("200-mushrooms-sample-revised.csv",
        function (d, i, names) {
            return {
                id: d.id,
                class: d.class,
                capshape: d.capshape,
                capcolor: d.capcolor,
                bruises: d.bruises,
                gillcolor: d.gillcolor,
                habitat: d.habitat
            };
    }).then(function (data) {
        console.log(data);

        // get the categories we want to keep
        // Citation: variable name and understanding of data processing process came from
        // https://www.d3-graph-gallery.com/graph/parallel_basic.html
        var dimensions = ["class", "capshape", "capcolor", "bruises", "gillcolor", "habitat"];

        // Below I create a bunch of scales to use to convert discrete data to different discrete data
        // Citation: My understanding of and formatting for these scales came from
        // https://www.d3indepth.com/scales/ and
        // https://www.d3-graph-gallery.com/graph/parallel_custom.html

        // build y scales
        yScale["class"] = d3.scalePoint()
            .domain(["e", "p"])
            .range([45, innerHeight])
            .padding(1);

        yScale["capshape"] = d3.scalePoint()
            .domain(["b","f","k","s","x"])
            .range([45, innerHeight])
            .padding(1);

        yScale["capcolor"] = d3.scalePoint()
            .domain(["n","b","c","g","p","u","e","w","y"])
            .range([45, innerHeight])
            .padding(1);

        yScale["bruises"] = d3.scalePoint()
            .domain(["f", "t"])
            .range([45, innerHeight])
            .padding(1);

        yScale["gillcolor"] = d3.scalePoint()
            .domain(["k","n","b","h","g","o","p","u","e","w","y"])
            .range([45, innerHeight])
            .padding(1);

        yScale["habitat"] = d3.scalePoint()
            .domain(["d", "g", "l", "m", "p", "u", "w"])
            .range([45, innerHeight])
            .padding(1);

        // build x scale
        xScale = d3.scalePoint()
            .range([45,innerWidth])
            .padding(1)
            .domain(dimensions);

        yDomain["class"] = ["e","p"]
        yDomain["capshape"] = ["b","f","k","s","x"]
        yDomain["capcolor"] = ["n","b","c","g","p","u","e","w","y"]
        yDomain["bruises"] = ["f","t"]
        yDomain["gillcolor"] = ["k","n","b","h","g","o","p","u","e","w","y"]
        yDomain["habitat"] = ["d", "g", "l", "m", "p", "u", "w"]

        var getFullWord = d3.scaleOrdinal()
            .domain(["classe", "classp",
                "capshapeb","capshapef","capshapek","capshapes","capshapex",
                "capcolorn","capcolorb","capcolorc","capcolorg","capcolorp",
                "capcoloru","capcolore","capcolorw","capcolory",
                "bruisesf", "bruisest",
                "gillcolork","gillcolorn","gillcolorb","gillcolorh","gillcolorg",
                "gillcoloro","gillcolorp","gillcoloru","gillcolore","gillcolorw",
                "gillcolory",
                "habitatd", "habitatg", "habitatl", "habitatm", "habitatp",
                "habitatu", "habitatw"])
            .range(["edible", "poisonous",
                "bell","flat","knobbed","sunken","convex",
                "brown","buff","cinnamon","grey","pink",
                "purple","red","white","yellow",
                "no", "yes",
                "black","brown","buff","chocolate","grey",
                "orange","pink","purple","red","white",
                "yellow",
                "woods", "grasses", "leaves", "meadows", "paths",
                "urban", "waste"])

        // create a point scale for each
        var colorScale = d3.scaleOrdinal()
            .domain(yDomain["class"])
            .range(["#028E29", "#8D0237"]) // complementary colours
                    // edible, poisonous
            // possible alt #621476, #287614

        var colorCS = d3.scaleOrdinal()
            .domain(yDomain["capshape"])
            .range(["#1F75FE", "#C154C1", "#91E351", "#FA8072",
                    "#FFFF99"])
                    //   bell,      flat,   knobbed,    sunken,
                    // convex.

        var imageCS = d3.scaleOrdinal()
            .domain(yDomain["capshape"])
            .range(["images/bell.png", "images/flat.png",
                    "images/knobbed.png", "images/sunken.png",
                    "images/convex.png"])

        // precise colors matter here
        var colorCC = d3.scaleOrdinal()
            .domain(yDomain["capcolor"])
            .range(["#964B00", "#FFC980", "#d2691e", "#808080",
                    "#ff91d6", "#874dba", "#ff3e3e", "#FFFFFF",
                    "#ffff76"])
                    //  brown,      buff,  cinnamon,      grey,
                    //   pink,    purple,       red,     white,
                    // yellow.              #ff3e3e

        var colorB = d3.scaleOrdinal()
            .domain(yDomain["bruises"])
            .range(["#e3e3be", "#1C216B"]) // complementary
                // no bruises,  bruises

        var imageB = d3.scaleOrdinal()
            .domain(yDomain["bruises"])
            .range(["images/nobruises.png", "images/bruises.png"])

        // precise colors matter here
        var colorGC = d3.scaleOrdinal()
            .domain(yDomain["gillcolor"])
            .range(["#1d1d1d", "#964B00", "#FFC980", "#7B3F00",
                    "#808080", "#FF7F00", "#ff91d6", "#874dba",
                    "#ff3e3e", "#FFFFFF", "#ffff76"])
                    //  black,     brown,      buff, chocolate,
                    //   grey,    orange,      pink,    purple,
                    //    red,     white,    yellow.

        var colorH = d3.scaleOrdinal()
            .domain(yDomain["habitat"])
            .range(["#443022", "#388004", "#71BC78", "#30ba8f",
                    "#832A0D", "#4C5866", "#011302"])
                    //  woods,   grasses,    leaves,   meadows,
                    //  paths,     urban,     waste.

        var imageH = d3.scaleOrdinal()
            .domain(yDomain["habitat"])
            .range(["images/woods.png", "images/grasses.png",
                    "images/leaves.png", "images/meadows.png",
                    "images/paths.png", "images/urban.png",
                    "images/waste.png"])

        // use appropriate scale based on the key
        function getImage (key, letter) {
            var myImage;
            if (key === "capshape") {
                myImage = imageCS(letter);
            }
            else if (key === "bruises") {
                myImage = imageB(letter);
            }
            else if (key === "habitat") {
                myImage = imageH(letter);
            }
            return myImage;
        }

        // use appropriate scale based on the key
        function getColor (key, letter) {
            var myColor;
            if (key === "class") {
                //console.log("C Color - Key: " + key + " - Letter: " + letter)
                myColor = colorScale(letter);
            }
            else if (key === "capshape") {
                //console.log("CS Color - Key: " + key + " - Letter: " + letter)
                myColor = colorCS(letter);
            }
            else if (key === "capcolor") {
                //console.log("CC Color - Key: " + key + " - Letter: " + letter)
                myColor = colorCC(letter);
            }
            else if (key === "bruises") {
                //console.log("B Color - Key: " + key + " - Letter: " + letter)
                myColor = colorB(letter);
            }
            else if (key === "gillcolor") {
                //console.log("GC Color - Key: " + key + " - Letter: " + letter)
                myColor = colorGC(letter);
            }
            else if (key === "habitat") {
                //console.log("H Color - Key: " + key + " - Letter: " + letter)
                myColor = colorH(letter);
            }
            else {
                myColor = "#FFFFFF"
            }
            return myColor;
        }

        // draw lines
        // Citation: the code for drawing the lines came from
        // https://www.d3-graph-gallery.com/graph/parallel_custom.html
        // and was adapted by me to suit my project
        chart.selectAll("lines")
            .data(data)
            .enter().append("path")
            .attr("class", function (d) {return "line " + "class"+d.class + " "
                                                        + "capshape"+d.capshape + " "
                                                        + "capcolor"+d.capcolor + " "
                                                        + "bruises"+d.bruises + " "
                                                        + "gillcolor"+d.gillcolor + " "
                                                        + "habitat"+d.habitat}) // more specific class name
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", d => colorScale(d.class))
            .style("stroke-width", "5")
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round")
            .style("opacity", "0.07")
            .on("mouseover", function (event, d) {
                //console.log("d class: " + d.class)
                d3.selectAll(".line")
                    .transition()
                    .duration(300)
                    .style("stroke", "white")
                    .style("stroke-width", "5")
                    .style("opacity", "0") // hide the line
                console.log("Class being highlighted: " + d.class);
                d3.selectAll(".class" + d.class)
                    .transition()
                    .duration(300)
                    .style("stroke", d => colorScale(d.class))
                    .style("stroke-width", "5")
                    .style("opacity", "0.07")
            })
            .on("mouseleave", function (event, d) {
                //console.log("Mouse left.")
                d3.selectAll(".line")
                    .transition()
                    .duration(300)
                    .style("stroke", d => colorScale(d.class))
                    .style("stroke-width", "5")
                    .style("opacity", "0.07")
            });

        // Citation: the below code for grouping the dimensions and adding the associated
        //  axes and titles was adapted from https://bl.ocks.org/jasondavies/1341281 and
        //  https://github.com/kalealex/parallel-coordinates-d3v5/blob/master/working/parallel-coodinates.js
        //  with the code inside .each() being my own

        // add group elements for dimensions
        // Citation: https://bl.ocks.org/jasondavies/1341281
        var g = chart.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) { return "translate(" + xScale(d) + ")"; })

        // add axes and titles
        // Citation: https://bl.ocks.org/jasondavies/1341281 and
        // https://github.com/kalealex/parallel-coordinates-d3v5/blob/master/working/parallel-coodinates.js
        g.append("g")
            .attr("class", function (d) { return "axis " + d; })
            .each(function (d) {
                console.log("d: " + d);
                // keep information for when we change out data (enter inner loop)
                var key = d;
                var myDomain = yDomain[key]

                if (key === "capshape") {
                    chart.selectAll("capPics")
                        .data(myDomain)
                        .enter().append("svg:image")
                        .attr("class", function (domainElement) {
                            return "image." + key + "." + domainElement;
                        })
                        .attr("x", function () {
                            return (xScale(key) - 25);
                        })
                        .attr("y", function (domainElement) {
                            return (yScale[key](domainElement) - 20);
                        })
                        .attr("width", "50")
                        .attr("height", "50")
                        .attr("xlink:href", function (domainElement) {
                            return getImage(key, domainElement);
                        })
                }
                else if ( key === "bruises" || key === "habitat") {
                    chart.selectAll("legendPics")
                        .data(myDomain)
                        .enter().append("svg:image")
                        .attr("class", function (domainElement) {
                            return "image." + key + "." + domainElement;
                        })
                        .attr("x", function () {
                            return (xScale(key) - 13);
                        })
                        .attr("y", function (domainElement) {
                            return (yScale[key](domainElement) - 18);
                        })
                        .attr("width", "25")
                        .attr("height", "25")
                        .attr("xlink:href", function (domainElement) {
                            return getImage(key, domainElement);
                        })
                }
                else {
                console.log(myDomain)
                chart.selectAll("legendDots")
                    .data(myDomain)
                    .enter().append("circle")
                    .attr("class", function (domainElement) {
                        return "dot." + key + "." + domainElement;
                    })
                    .attr("cx", function () {
                        return xScale(key);
                    })
                    .attr("cy", function (domainElement) {
                        return yScale[key](domainElement);
                    })
                    .attr("r", "7")
                    .style("fill", function (domainElement) {
                        return getColor(key, domainElement)
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "2");
                }})
            .append("text")
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .attr("font-size", "12")
            .attr("font-family", "helvetica")
            .attr("y", 75)
            .text(function (d) { return d; })

        // function for determining where to draw the lines
        // Citation: this code is from https://www.d3-graph-gallery.com/graph/parallel_custom.html
        function path(d) {
            return d3.line()(dimensions.map(function (key) {
                return [xScale(key), yScale[key](d[key])];
            }));
        }

        // interaction for images
        chart.selectAll("image")
            .on("click", event => myFilterLines(event))
            .on("mouseover", function (event, d) {
                console.log(event.target.getAttribute("class"));
                var fullName = event.target.getAttribute("class");
                var key = splitString(fullName)[1];
                var letter = splitString(fullName)[2];
                d3.selectAll(".axis."+ key)
                    .append("text")
                    .attr("class", "sublabel")
                    .attr("text-anchor", "left")
                    .attr("fill", "#979797")
                    .attr("font-size", "12")
                    .attr("x", "35") // 40
                    .attr("y", "74.8")
                    .text(getFullWord(key + letter));
            })
            .on("mouseout", function (event, d) {
                // hide label
                d3.selectAll(".sublabel")
                    .attr("font-size", "0");
            });


        // interaction for dots
        chart.selectAll("circle")
            .on("mouseover", function (event, d) {
                var fullName = event.target.getAttribute("class");
                //console.log(event.target.getAttribute("class"));
                d3.select(this)
                    .attr("r", "10")
                var key = splitString(fullName)[1];
                var letter = splitString(fullName)[2];
                d3.selectAll(".axis."+ key)
                    .append("text")
                    .attr("class", "sublabel")
                    .attr("text-anchor", "left")
                    .attr("fill", "#979797")
                    .attr("font-size", "12")
                    .attr("x", "35") // 40
                    .attr("y", "74.8")
                    .text(getFullWord(key + letter));
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .attr("r", "7")
                d3.selectAll(".sublabel")
                    .attr("font-size", "0");
            })
            .on("click", event => myFilterLines(event));

        function myFilterLines (event) {
            var fullName = event.target.getAttribute("class");
            console.log(splitString(fullName));
            var mySplitString = splitString(fullName);
            d3.selectAll(".line")
                .transition()
                .duration(300)
                .style("opacity", "0");
            d3.selectAll("."+ mySplitString[1] + mySplitString[2])
                .transition()
                .duration(300)
                .style("opacity", "0.2");
        }

    });
    console.log(promise);
}

// split up string by dots into an array
function splitString (string) {
    console.log("String to split: " + string)
    var toSplit = string;
    var stringComponents = toSplit.split(".");
    return stringComponents;
}

// this function is from tutorials (citation: TA Nathan)
function makeInnerArea(chart) {
    return chart.append("rect")
        .attr("class", "inner")
        .attr("x", margins.left)
        .attr("y", margins.top)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "white");
}
