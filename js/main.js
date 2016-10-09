// checks if there are posts in the timeline that could not be parsed and parse date correctly
function fixTimelines(timeline, i, array) {
    var counter = 1,
        j;

    //check the ranking for missing posts
    function findOrder(post) {
        return post.order === counter;
    }

    //return at most 25 posts
    function getTopThirty(post) {
        return post.order <= 25;
    }

    for (j = 0; j < timeline.length; j++) {
        var order = timeline.find(findOrder);
        if (order === undefined) {
            timeline.splice(counter - 1, 0, {
                "order": counter,
                "type": "broken",
                "postId": null
            });
        }
        counter++;
    }
    array[i] = timeline.filter(getTopThirty);
}

var labels = d3.select("body")
    .append("div")
    .attr("class", "labels"),

    main = d3.select("body")
    .append("div")
    .attr("class", "main"),

    toggleBox = d3.select(".toggle-slider")
        .on("click", function() {
            var btn = d3.select(this),
                container = d3.select(".main");

            btn.classed("on", !btn.classed("on"));
            container.classed("on", !container.classed("on"));
        })

d3.json("data/data5min.json", function(error, data) {
    if (error) return console.error(error);
    //console.log(data);
    data.timelines.forEach(fixTimelines);
    //console.log(data);
    var clicked = false;

    var topContainer = labels.selectAll("div.container")
        .data(data.refreshes)
        .enter()
        .append("div")
        .attr("class", "container"),

        timestamp = topContainer.append("div")
        .attr("class", "timestamp");

    timestamp.append("p")
        .text(function(d, i) {
            var parse = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ"),
                formatDate = d3.timeFormat("%e %b %Y"),
                date = formatDate(parse(d.refreshTime));
            return date;
        });

    timestamp.append("p")
        .text(function(d, i) {
            var parse = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ"),
                formatTime = d3.timeFormat("%H:%M"),
                time = formatTime(parse(d.refreshTime));
            return time;
        });

    var bottomContainer = main.selectAll("div.container")
        .data(data.timelines)
        .enter()
        .append("div")
        .attr("class", "container"),

        timeline = bottomContainer.selectAll("div.posts")
        .data(function(d) {
            return d;
        })
        .enter()
        .append("div")
        .attr("class", "timeline")
        .attr("data-id", function(d) {
            if (d.postId === null) {
                if (d.hasOwnProperty("href")) {
                    var re = /\n/g,
                        newRef = d.href.replace(re, " ");
                    var finalRef = newRef.replace(/"\sdata-t.*/, "");
                    return finalRef;
                }
            } else {
                return d.postId;
            }
        })
        .style("background-color", function(d) {
            if (d.type === "broken") {
                return "#414141";
            } else if (d.type === "feed") {
                return "#81e3ea";
            } else if (d.type === "promoted") {
                return "#f76f61";
            } else {
                return "#eaea5e";
            }
        })
        .style("cursor", function(d) {
            if (d.type !== "broken") {
                return "pointer";
            }
        })
        .on("click", function(d) {
            clicked = !clicked;
            if (clicked) {
                if (d.type !== "broken") {
                    var dataId = d3.select(this).attr("data-id");

                    d3.selectAll(".main .timeline:not([data-id='" + dataId + "'])")
                        .classed("fade", true);
                    d3.selectAll(".main .timeline[data-id='" + dataId + "']")
                        .classed("highlight", true);
                }
            } else {
                d3.selectAll(".timeline")
                    .classed("fade", false);
                d3.selectAll(".timeline")
                    .classed("highlight", false);
            }
        })
        .on("mouseover", function(d) {
            if (!clicked) {
                if (d.type !== "broken") {
                    var dataId = d3.select(this).attr("data-id");

                    d3.selectAll(".main .timeline:not([data-id='" + dataId + "'])")
                        .classed("fade", true);
                    d3.selectAll(".main .timeline[data-id='" + dataId + "']")
                        .classed("highlight", true);
                }
            }
        })
        .on("mouseout", function(d) {
            if (!clicked) {
                d3.selectAll(".timeline")
                    .classed("fade", false);
                d3.selectAll(".timeline")
                    .classed("highlight", false);
            }
        });

    timeline.append("p")
        .attr("class", "post-order")
        .text(function(d) {
            return d.order + "º";
        });

    timeline.append("div")
        .append("p")
        .attr("class", "post-time")
        .text(function(d) {
            if (d.hasOwnProperty("creationTime")) {
                var parse = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ"),
                    formatTime = d3.timeFormat("%H:%M"),
                    time = formatTime(parse(d.creationTime)),
                    formatDate = d3.timeFormat("%e %b '%y"),
                    date = formatDate(parse(d.creationTime));
                return date + ", " + time;
            }
        });

});
