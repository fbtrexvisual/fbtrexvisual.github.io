// checks if there are posts in the timeline that could not be parsed
function checkIfMissingPosts(timeline, i, array) {
    var counter = 1,
        j;
    
    //check the ranking for missing posts
    function findOrder(post) {
        return post.order === counter;
    }
    
    //cut timeline at first 30 posts
    function getTopThirty(post) {
        return post.order <= 30;
    }
    
    for (j = 0; j < timeline.length; j++) {
        var order = timeline.find(findOrder);
        if (order === undefined) {
            timeline.splice(counter - 1, 0, {"order": counter, "type": "broken", "postId": null});
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
    .attr("class", "main");

d3.json("data/refreshEvery5min+1hour.json", function (error, data) {
    if (error) return console.error(error);
    //console.log(data);
    data.timelines.forEach(checkIfMissingPosts);
    //console.log(data);
    
    var topContainer = labels.selectAll("div.container")
        .data(data.refreshes)
        .enter()
        .append("div")
        .attr("class", "container"),
    
        timestamp = topContainer.append("div")
        .attr("class", "timestamp")
        .append("p")
        .text(function (d, i) {
            return d.refreshTime.substring(11, 16);
        }),
    
        bottomContainer = main.selectAll("div.container")
        .data(data.timelines)
        .enter()
        .append("div")
        .attr("class", "container"),
    
        timeline = bottomContainer.selectAll("div.posts")
        .data(function (d) {return d; })
        .enter()
        .append("div")
        .attr("class", "timeline")
        .attr("data-id", function (d) {
            if (d.postId === null) {
                if (d.hasOwnProperty("href")) {
                    return d.href;
                }
            } else {
                return d.postId;
            }
        })
        .style("background-color", function (d) {
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
        .style("cursor", function (d) {
            if (d.type != "broken") {
                return "pointer";
            }
        })
        .on("mouseover", function (d) {
            if (d.type != "broken") {
                var dataId = d3.select(this).attr("data-id");
                //console.log(dataId);
                d3.selectAll(".main .timeline:not([data-id='" + dataId + "'])")
                    .classed("fade", true);
                d3.selectAll(".main .timeline[data-id='" + dataId + "']")
                    .classed("highlight", true);
            }
        })
        .on("mouseout", function (d) {
            d3.selectAll(".timeline")
                .classed("fade", false);
            d3.selectAll(".timeline")
                .classed("highlight", false);
        })
        .append("p")
        .text(function (d) {
            return d.order + "°";
        });
});