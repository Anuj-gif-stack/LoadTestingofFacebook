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

    var data = {"OkPercent": 93.94533198420955, "KoPercent": 6.054668015790448};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9343359128200013, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9304152703934826, 500, 1500, "Post Created"], "isController": false}, {"data": [0.9295605057194462, 500, 1500, "Update Post"], "isController": false}, {"data": [0.9360445032102824, 500, 1500, "Comet Video Home"], "isController": false}, {"data": [0.9402489428291564, 500, 1500, "Post Posted"], "isController": false}, {"data": [0.9354903847295966, 500, 1500, "Feed Story Optimise"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 421014, 25491, 6.054668015790448, 1467.794667160714, 148, 21153, 179.0, 21043.0, 21055.0, 21074.0, 1323.2692779150243, 2727.1790540275083, 2295.5268635750026], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Post Created", 84451, 5448, 6.451078139986501, 1541.0653515056101, 148, 21114, 179.0, 262.0, 21049.0, 21080.0, 268.75023867411755, 586.5780105855949, 479.9924987956902], "isController": false}, {"data": ["Update Post", 84711, 5690, 6.716955295062035, 1591.0827401400022, 148, 21153, 175.0, 265.90000000000146, 21045.0, 21071.0, 269.3102483563717, 534.9918803380168, 437.43393918614964], "isController": false}, {"data": ["Comet Video Home", 83949, 4941, 5.885716327770432, 1422.8779139715814, 149, 21125, 179.0, 226.0, 21046.0, 21074.0, 267.62112430902243, 583.280745415001, 525.8763939098334], "isController": false}, {"data": ["Post Posted", 83714, 4225, 5.046945552715197, 1308.5953245574312, 148, 21129, 174.0, 216.0, 16314.900000000001, 21057.0, 263.7168085836964, 520.5125285881696, 433.5663117805704], "isController": false}, {"data": ["Feed Story Optimise", 84189, 5187, 6.161137440758294, 1473.3332976992328, 149, 21115, 174.0, 238.0, 21035.0, 21054.0, 268.1255195212602, 531.4872337354017, 443.7503159923374], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 0.003922953199168334, 2.375217926244733E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 25490, 99.99607704680083, 6.054430493997824], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 421014, 25491, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 25490, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Post Created", 84451, 5448, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 5448, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Update Post", 84711, 5690, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 5689, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Comet Video Home", 83949, 4941, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 4941, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Post Posted", 83714, 4225, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 4225, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Feed Story Optimise", 84189, 5187, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.facebook.com:443 [www.facebook.com/163.70.144.35] failed: Connection timed out: connect", 5187, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
