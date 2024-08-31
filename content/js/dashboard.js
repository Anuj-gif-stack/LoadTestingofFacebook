/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 89.8048730125955, "KoPercent": 10.195126987404501};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7386175924014041, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.948, 500, 1500, "Post Created"], "isController": false}, {"data": [0.866, 500, 1500, "News feed showing"], "isController": false}, {"data": [0.961, 500, 1500, "Update Post"], "isController": false}, {"data": [0.30830903790087466, 500, 1500, "Facebook Page-0"], "isController": false}, {"data": [0.7201166180758017, 500, 1500, "Facebook Page-1"], "isController": false}, {"data": [0.94325, 500, 1500, "Comet Video Home"], "isController": false}, {"data": [0.95675, 500, 1500, "Post Posted"], "isController": false}, {"data": [0.77775, 500, 1500, "Click to refresh"], "isController": false}, {"data": [0.9645, 500, 1500, "Feed Story Optimise"], "isController": false}, {"data": [0.0445, 500, 1500, "Facebook Page"], "isController": false}, {"data": [0.33975, 500, 1500, "User Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19372, 1975, 10.195126987404501, 3487.4606648771437, 148, 21078, 191.0, 21019.0, 21049.0, 21059.0, 288.20090155764166, 1515.236987225144, 607.1763868561897], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Post Created", 2000, 0, 0.0, 228.78550000000024, 154, 2071, 178.0, 521.5000000000005, 608.0, 725.98, 30.8090455357693, 66.11980711130538, 58.82000392815331], "isController": false}, {"data": ["News feed showing", 2000, 0, 0.0, 303.88400000000007, 151, 2929, 181.0, 618.0, 657.0, 739.99, 30.864197530864196, 66.2326991705247, 140.39592978395063], "isController": false}, {"data": ["Update Post", 2000, 0, 0.0, 212.6225000000003, 148, 1521, 174.0, 286.0, 555.8999999999996, 648.99, 30.869437713192053, 59.710430807120034, 53.75020258068499], "isController": false}, {"data": ["Facebook Page-0", 686, 0, 0.0, 8253.463556851311, 200, 20448, 7271.0, 16287.5, 17047.1, 20332.16, 32.536520584329345, 133.68026221008822, 15.759877158034529], "isController": false}, {"data": ["Facebook Page-1", 686, 0, 0.0, 711.0131195335274, 213, 4304, 409.0, 1509.1000000000004, 2137.3, 2314.99, 32.33103968328777, 764.6703915160477, 17.0811449889245], "isController": false}, {"data": ["Comet Video Home", 2000, 0, 0.0, 239.8584999999998, 151, 1891, 177.0, 537.0, 634.8999999999996, 1050.98, 30.754090294009103, 66.00901467258427, 64.2111768052651], "isController": false}, {"data": ["Post Posted", 2000, 0, 0.0, 222.1014999999999, 152, 1560, 173.0, 336.60000000000036, 590.9499999999998, 1034.97, 30.754563208316032, 59.49524313404376, 53.24984430502375], "isController": false}, {"data": ["Click to refresh", 2000, 33, 1.65, 2773.1945000000005, 157, 21052, 282.5, 15302.9, 15508.9, 21026.0, 31.08534481418735, 53.58196671148137, 161.90851935159856], "isController": false}, {"data": ["Feed Story Optimise", 2000, 0, 0.0, 211.07250000000013, 150, 1559, 173.0, 262.8000000000002, 552.8999999999996, 650.98, 30.77207126811706, 59.52843663934363, 54.27183663107364], "isController": false}, {"data": ["Facebook Page", 2000, 1314, 65.7, 16900.450000000044, 426, 21078, 21035.0, 21056.0, 21058.0, 21068.99, 86.59133220764602, 977.8296592901675, 30.077888226825994], "isController": false}, {"data": ["User Login", 2000, 628, 31.4, 9612.759499999991, 206, 21074, 7388.0, 21055.0, 21060.0, 21066.0, 45.842119739616756, 740.135595080854, 33.0446473594939], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 1975, 100.0, 10.195126987404501], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19372, 1975, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 1975, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Click to refresh", 2000, 33, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 33, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Facebook Page", 2000, 1314, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 1314, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["User Login", 2000, 628, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 628, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
