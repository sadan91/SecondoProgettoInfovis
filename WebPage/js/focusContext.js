function drawFocusContextChart(data) {

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        },

        margin2 = {
            top: 490,
            right: 10,
            bottom: 20,
            left: 40
        },

        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 570 - margin2.top - margin2.bottom;

    // Calcolo il dominio di x
    var xDomain = [];
    var i;
    for (i = 0; i < data.length; i++) {
        xDomain.push(data[i].id);
    }


    var x = d3.scale.ordinal()
        .rangeBands([0, width], .1);

    var x2 = d3.scale.ordinal()
        .rangeBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var y2 = d3.scale.linear()
        .range([height2, 0]);

    x.domain(xDomain);

    x2.domain(x.domain());
    y.domain([0, d3.max(data, function (d) {
        return d.packets;
    })]);
    y2.domain(y.domain());

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues(function () {
            if (xDomain.length < 50) {
                return xDomain;
            } else {
                return [];
            }
        });
    //.tickValues([]);

    var xAxis2 = d3.svg.axis()
        .scale(x2)
        .orient("bottom")
        .tickFormat("")
        .tickSize(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    function brushDefaultExtent() {
        if (x2.range().length > 18) {
            return x2.range()[19];
        } else {
            return 0;
        }
    }

    var brush = d3.svg.brush()
        .x(x2)
        .extent([0, brushDefaultExtent()]) //Inizializzo il grafico affinchè visualizzi i primi 20 valori
        .on("brush", brushed);

    var svg = d3.select("#chart3")
        //.attr("width", width + margin.left + margin.right)
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom + 100).append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y", 25)
        .attr("dy", ".71em")
        .attr("x", "830")
        .text("Flow Id");

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Pacchetti");

    focus.selectAll(".barFocus")
        .data(data)
        .enter().append("rect")
        .attr("class", "barFocus")
        .attr("x", function (d) {
            return x(d.id);
        })
        .attr("id", function (d) {
            return d.id;
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.packets);
        })
        .attr("height", function (d) {
            return height - y(d.packets);
        });

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.selectAll(".barFocus")
        .data(data)
        .enter().append("rect")
        .attr("class", "barFocus")
        .attr("x", function (d) {
            return x2(d.id);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y2(d.packets);
        })
        .attr("height", function (d) {
            return height2 - y2(d.packets);
        });

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .call(brush.event)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 5);


    /* Aggiungo i tip alle barre se non sono troppe */
    if (xDomain.length < 50) {
        $('.focus .barFocus').tipsy({
            gravity: 'sw',
            html: true,
            title: function () {
                /* Estraggo l'entry corretta */
                var entry = entries[parseInt(this.id)];

                /* Scrivo la descrizione */
                var description = "type: " + entry.packetType + "<br>";
                description += "ip in: " + entry.ip_add_in + "<br>";
                description += "ip out: " + entry.ip_add_out + "<br>";
                description += "packets: " + entry.n_packets + "<br>";
                return description;

            }
        });

        /* Aggiungo l'effetto hover per tutte le barre con i tip */
        $('.focus .barFocus').hover(function () {
            $(this).css({
                fill: 'brown'
            });
        }, function () {
            $(this).css({
                fill: '#4682B4'
            })
        });

    }



    function brushed() {
        var ids = getBrushedIds(brush.extent()[0], brush.extent()[1]);
        if (ids.length > 0) {
            x.domain(ids);
        } else {
            x.domain(x2.domain());
        }


        var enterData = [];
        var i;
        var j = 0;
        for (i = 0; i < data.length && j < ids.length; i++) {
            if (ids[j] === data[i].id) {
                enterData.push(data[i]);
                j++;
            }
        }


        //Al momento accantono l'idea perchè esteticamente poco efficace
        // Scalo l'asse delle y
        //        if (ids.length > 0) {
        //            y.domain([0, d3.max(enterData, function (d) {
        //                return d.packets;
        //            })]);
        //        }

        // Cambio le barre
        focus.selectAll(".barFocus").remove();

        if (ids.length > 0) {
            focus.selectAll(".barFocus")
                .data(enterData)
                .enter().append("rect")
                .attr("class", "barFocus")
                .attr("x", function (d) {
                    return x(d.id);
                })
                .attr("id", function (d) {
                    return d.id;
                })
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(d.packets);
                })
                .attr("height", function (d) {
                    return height - y(d.packets);
                });

        } else {
            focus.selectAll(".barFocus")
                .data(data)
                .enter().append("rect")
                .attr("class", "barFocus")
                .attr("x", function (d) {
                    return x(d.id);
                })
                .attr("id", function (d) {
                    return d.id;
                })
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(d.packets);
                })
                .attr("height", function (d) {
                    return height - y(d.packets);
                });
        }

        /* Aggiungo i tip alle barre */
        if (xDomain.length < 50 || (ids.length < 50 && ids.length !== 0)) {
            $('.focus .barFocus').tipsy({
                gravity: 'sw',
                html: true,
                title: function () {
                    /* Estraggo l'entry corretta */
                    var entry = entries[parseInt(this.id)];

                    /* Scrivo la descrizione */
                    var description = "type: " + entry.packetType + "<br>";
                    description += "ip in: " + entry.ip_add_in + "<br>";
                    description += "ip out: " + entry.ip_add_out + "<br>";
                    description += "packets: " + entry.n_packets + "<br>";
                    return description;

                }
            });


            /* Aggiungo l'effetto hover per tutte le barre con i tip */
            $('.focus .barFocus').hover(function () {
                $(this).css({
                    fill: 'brown'
                });
            }, function () {
                $(this).css({
                    fill: '#4682B4'
                })
            });

        } else {
            $('.focus .barFocus').tipsy('disable');
        }


        // Al momento accantono l'idea perchè esteticamente poco efficace
        //focus.select(".y.axis").call(yAxis);

        //Mostro i valori sull'asse delle x se non sono troppo numerosi
        if (xDomain.length < 50 || (ids.length < 50 && ids.length !== 0)) {
            if (ids.length !== 0) {
                xAxis.tickValues(ids);
            } else {
                xAxis.tickValues(xDomain);
            }
        } else {
            xAxis.tickValues([]);
        }
        focus.select(".x.axis").call(xAxis);
    }

    /** Questa funzione prende tutti gli id che sono stati selezionati dal brush */
    function getBrushedIds(brushMin, brushMax) {
        var i;
        var ids = [];
        for (i = 0; i < xDomain.length; i++) {
            if (x2(xDomain[i]) >= brushMin && x2(xDomain[i]) <= brushMax) {
                ids.push(xDomain[i]);
            }
        }
        return ids;
    }
}