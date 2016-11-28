var app = angular.module('ebcttwebapp', [
'ngRoute'
]);

//Angular Routes
app.config(['$routeProvider', function ($routeProvider) {	
	$routeProvider
	.when('/summary', {templateUrl: 'partials/summary.html' /*, controller: 'AppController'*/})                
    .when('/', {redirectTo:"/elections"})
	.when('/elections', {templateUrl: 'partials/index.html' /*, controller: 'AppController'*/})				
	.when('/elections/lead_chart', {templateUrl: 'partials/leader-charts.html' , controller: 'AppController'})				
    .otherwise({redirectTo: '/'});	
}]);

//Angular Services
app.service('routeService', function($rootScope, $location, $http) {
	var service = {};
	
	service.go= function(path) {
		$location.path( path );
	};
	return service;
});

app.factory ('config', function ($http) {
    return $http.get('/Results/ebc-webapp-local-govt-2016/config/config.json');
    //return $http.get('/Results/ebc-webapp/config/config.json');
    //return $http.get('/config/config.json');
});

app.factory ('totals', function () {
    return {
        "pnm": 0,
        "unc": 0,
        "ilp":0,
        "cop":0,
        "other": 0
    };
});

app.factory ('stations', function () {
    return {
        'ins': 0,
        'total': 0
    };
});


app.run( function($rootScope, $location) {

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {      
        // no logged user, we should be going to #login
        if ( next.templateUrl == "partials/index.html" ) {
          // already going to #elections, no redirect needed
        } 
        else
        if ( next.templateUrl == "partials/summary.html" ) {
          // already going to #elections, no redirect needed
        }         
        else {
          // not going to #login, we should redirect now
          $location.path( "/elections" );
        }              
    });
});
				
//defines the functionality of the application

app.controller('AppController', function($scope, $http, $location, $log, routeService){
    $scope.isChart= function(){    
        return path= $location.path(), 
                _.contains(['/elections',
                            '/elections/lead_chart'],path);
    };        
        
});//end AppController

app.controller('LeadingsCtrl', function($scope, $http, $location, $log, $interval, routeService, config, totals, stations) {
    $scope.initLeaderBoard = function () {
        
        config.then(function (settings) {
            //console.log("LeadingsCtrl: Loading config file...");                        
            var settings = settings.data;                        
            
            //$http.get(settings.file).then(function (results) {
            $http.get(settings.origin + settings.pathname).then(function (results) {
                //console.log("Loading data for leaderboard...");
                //console.log(results.data.head);
                var item = results.data.head;
                //console.log("Loading data for leaderboard item...");
                //console.log(item);

                item.sort(function(a, b) {
                    return parseInt(b.r_count) - parseInt(a.r_count);
                });
                
                //console.log(item);
                $scope.lead = item;
            });
        });                        
    }
    
    $scope.initTotals = function () {
        $scope.total_pnm = totals.pnm;
        $scope.total_unc = totals.unc;
        $scope.total_ilp = totals.ilp;
        $scope.total_cop = totals.cop;
        $scope.total_other = totals.other;
        $scope.total_in = stations.ins;
        $scope.total_ps = stations.total;
    };
    
    $scope.poll = function () {
        config.then(function (settings) {
            $interval($scope.initLeaderBoard, settings.data.interval);    
            $interval($scope.initTotals, settings.data.interval);    
        });
    };
    
    $scope.initLeaderBoard();
    $scope.initTotals();
    $scope.poll();    
});

app.controller('ReportsCtrl', function($scope, $http, $location, $log, $interval, routeService, config){                                   
    var chartData = [],
        chartLabels = [],
        barChartData, ctx;
    
    $scope.initReport = function () {        
        //console.log("loading report data...");                
        config.then(function (settings) {
            //console.log("ReportsCtrl: Loading config file...");                        
            var settings = settings.data;
            
            //$http.get(settings.file).then(function (results) {                                    
            $http.get(settings.origin + settings.pathname).then(function (results) {                                    

//                var barChartData, ctx,                
//                    total = [results.data.head[0].count, results.data.head[1].count, results.data.head[2].count],
//                    names = [results.data.head[0].code, results.data.head[1].code, results.data.head[2].code];    
                
                //data base on electoral districts
                //chartData = [results.data.head[0].count, results.data.head[1].count, results.data.head[2].count],
                chartData = [results.data.head[0].r_count, results.data.head[1].r_count, results.data.head[2].r_count],
                chartLabels = [results.data.head[0].code, results.data.head[1].code, results.data.head[2].code];    

//                barChartData = {
//                    labels : names,
//                    datasets : [                    
//                        {
//                            fillColor : "rgba(151,187,205,0.5)",
//                            strokeColor : "rgba(151,187,205,0.8)",
//                            highlightFill : "rgba(151,187,205,0.75)",
//                            highlightStroke : "rgba(151,187,205,1)",
//                            data : total
//                        }
//                    ]
//                };                        
//
//                ctx = document.getElementById("canvas").getContext("2d");
//                window.myBar = new Chart(ctx).Bar(barChartData, {   
//                    barShowStroke: false,                
//                    responsive : true,
//                    animation : true,
//                    animationSteps: 10
//                });                                 
//
//                myBar.datasets[0].bars[0].fillColor = "#FF3434"; //bar 1
//                myBar.datasets[0].bars[1].fillColor = "#FFE93C"; //bar 2
//                myBar.datasets[0].bars[2].fillColor = "#c0c0c0"; //bar 3                                
//                myBar.update();
            });
        });        
    };
    
    $scope.resetCanvas = function () {
        $('#canvas-holder').remove();
        $('#canvas_container').append('<div style="width: 100%;" id="canvas-holder"><canvas id="canvas" height="410" width="560"></canvas></div>');                
    };
    
//    $scope.initChart = function () {
        barChartData = {
            labels : ["PNM", "PP", "Other"],
            datasets : [                    
                {
                    fillColor : "rgba(151,187,205,0.5)",
                    strokeColor : "rgba(151,187,205,0.8)",
                    highlightFill : "rgba(151,187,205,0.75)",
                    highlightStroke : "rgba(151,187,205,1)",
                    data : [0, 0, 0]
                }
            ]
        };                        

        ctx = document.getElementById("canvas").getContext("2d");
        window.myBar = new Chart(ctx).Bar(barChartData, {   
            barShowStroke: false,                
            responsive : true,
            animation : true,
            animationSteps: 10
        });                                 

        myBar.datasets[0].bars[0].fillColor = "#FF3434"; //bar 1
        myBar.datasets[0].bars[1].fillColor = "#FFE93C"; //bar 2
        myBar.datasets[0].bars[2].fillColor = "#c0c0c0"; //bar 3                                
        myBar.update();
                
//    };
    
    $scope.updateChart = function () {
//        console.log(chartData);
//        console.log(chartLabels);
        window.myBar.datasets[0].bars[0].value = chartData[0];
        window.myBar.datasets[0].bars[1].value = chartData[1];
        window.myBar.datasets[0].bars[2].value = chartData[2];
        window.myBar.update();
    };
    
    $scope.poll = function () {
        config.then(function (settings) {
            //var chart = $scope.initChart();
            //$interval($scope.resetCanvas, settings.data.interval);                        
            $interval($scope.initReport, settings.data.interval);                                       
            $interval($scope.updateChart, settings.data.interval);                                       
        });
    };
    
    $scope.initReport();
    $scope.updateChart();
    $scope.poll();
           
});

app.controller('ListingCtrl', function($scope, $http, $location, $log, $interval, routeService, config, totals, stations) {     
    //console.log("Loading headings...");
    
    $scope.initResults = function () {
        //$scope.summary = {data: new Array()};
        config.then(function (settings) {
            //console.log("ReportsCtrl: Loading config file...");                        
            var settings = settings.data;
            
            //$http.get(settings.file).then(function (results) {            
            $http.get(settings.origin + settings.pathname).then(function (results) {            
                var num_codes = results.data.party_codes.length,
                    arr = [];                        

                for (var i = 0; i < num_codes; i++) {
                    var obj = {
                        "code": results.data.party_codes[i]
                    };                                
                    arr.push(obj);
                }

                $scope.codes = arr;
            });            

            //console.log("Loading results...");

            //$http.get(settings.file).then(function (results) {  
            $http.get(settings.origin + settings.pathname).then(function (results) { 
                //console.log("Displaying totals...");
                //console.log(totals);
                var tableData = results.data.table,
                    max = 0, pnm = 0, unc = 0, 
                    cop = 0, ilp = 0, total_pnm = 0, 
                    total_unc = 0, total_ilp =0, total_cop = 0, total_other = 0,
                    total_in = 0, total_ps = 0;
                
                var rc_counts,
                    rc_district_ps = 0,
                    rc_max =0;

                //console.log(tableData);
                //for each regCorp r in list
                //  for each district d in r.districts
                //     Keep track of the total votes for 
                //     unc, pnm, ilp, cop and max 
                //     as r.unc, r.pnm, r.ilp, r.cop and r.lead
                //     sum the number of ps in and number of ps (i.e., the total amount of ps)
                var tableRows = new Array();
                var summaryRows = new Array();

                var rcCounts = {};
                for (var j = 0; j < results.data.party_codes.length; j++) {
                    rcCounts[results.data.party_codes[j]] =0;
                }

                for(var k =0; k <tableData.length; k++){
                    
                    var totalRow ={};
                    var summaryRow = {};
                    rc_counts = new Array(4);//0-pnm, 1-unc, 2-cop, 3-ilp
                    for(var l =0; l <rc_counts.length; l++)rc_counts[l] =0;

                    rc_total_in =0;
                    rc_district_ps = 0;
                    rc_max =0;

                    totalRow.rName =tableData[k].name;
                    summaryRow.rName =tableData[k].name;

                    var counts = {};
                    var districtCounts = {};
                    
                    
                    for (var j = 0; j < results.data.party_codes.length; j++) {
                        counts[results.data.party_codes[j]] =0;
                        districtCounts[results.data.party_codes[j]] =0;
                    }

                    for (var i = 0; i < tableData[k].districts.length; i++) {
                        //For each electoral district E.g. MALABAR SOUTH
                        //The the votes array
                        var district = tableData[k].districts[i];

                        district.index = k+1;
                        district.rName = tableData[k].name;
                        district.rRowSpan = tableData[k].districts.length + 1;
                        district.rShowName =0;



                        if(i === 0 ) district.rShowName =1; 
                        
                        var votes = district.votes;
                        
                        total_in += district.num_in;
                        total_ps += district.num_ps_total;

                        rc_total_in += district.num_in;
                        rc_district_ps += district.num_ps_total;
                        
                        var maxVotesInDistrictCode = {};
                        
                        for (var j = 0; j < votes.length; j++) {
                            //Find the max votes in the votes array
                            if (parseInt(votes[j].count) > max){
                                max = parseInt(votes[j].count);
                                maxVotesInDistrictCode = votes[j].code; 
                            } 
                            
                            counts[votes[j].code]+= votes[j].count;

                            if (votes[j].code == "PNM") {
                                pnm = parseInt(votes[j].count);   
                                total_pnm += pnm;
                                rc_counts[0] += pnm;
                            }
                            else
                            if (votes[j].code == "UNC") {
                                unc = parseInt(votes[j].count);                            
                                total_unc += unc;
                                rc_counts[1] += unc;
                            }
                            else
                            if (votes[j].code == "COP") {
                                cop = parseInt(votes[j].count);                            
                                total_cop += cop;
                                rc_counts[2] += cop;
                            }
                            else
                            if (votes[j].code == "ILP") {
                                ilp = parseInt(votes[j].count);                            
                                total_ilp += ilp;
                                rc_counts[3] += ilp;
                            }
                            else{
                                total_other += parseInt(votes[j].count);
                            }
                        }


                        districtCounts[maxVotesInDistrictCode]+=1;

                        //mark up the js object with data for the view
                        district.lead = max;
                        district.pnm = pnm;
                        district.unc = unc;
                        district.cop = cop;
                        district.ilp = ilp;
                        
                        max = 0; pnm = 0; unc = 0;
                        cop = 0; ilp = 0;

                        tableRows.push(district);
                    } 

                    
                    totalRow.name = "TOTALS";
                    totalRow.rRowSpan = 1;
                    totalRow.rShowName =0;
                    totalRow.num_in = rc_total_in;
                    totalRow.num_ps_total = rc_district_ps;

                    rc_max =0;
                    var number;
                    
                    //max by votes
                    for(var l=0; l<results.data.party_codes.length; l++){
                        number = counts[results.data.party_codes[l]];
                        if(number > rc_max){
                            rc_max = number;
                            //maxCode = results.data.party_codes[l];
                        }
                    }

                    summaryRow.name = "TOTALS";
                    summaryRow.rRowSpan = 1;
                    summaryRow.rShowName =0;
                    summaryRow.num_in = rc_total_in;
                    summaryRow.num_ps_total = rc_district_ps;
                    //max by districts
                    var maxDistrictCount = 0;
                    var maxCode = {};
                    var hasMaxCount =0;

                    for(var l=0; l<results.data.party_codes.length; l++){
                        number = districtCounts[results.data.party_codes[l]];
                        if(number > maxDistrictCount){
                            maxDistrictCount = number;
                            maxCode = results.data.party_codes[l];
                            hasMaxCount = 1;
                        }
                        else
                        if(number == maxDistrictCount){
                            hasMaxCount+=1;
                        }
                    }                    

                    if(maxCode && hasMaxCount == 1)rcCounts[maxCode]+=1;

                    //mark up the counts for the totalRow by votes
                    totalRow.lead = rc_max;
                    totalRow.pnm = rc_counts[0];
                    totalRow.unc = rc_counts[1];
                    totalRow.cop = rc_counts[2];
                    totalRow.ilp = rc_counts[3];    

                    var totalVotes = new Array();
                    for (var j = 0; j < results.data.party_codes.length; j++) {
                        totalVotes.push({code:results.data.party_codes[j], count:counts[results.data.party_codes[j]]});
                    }
                    totalRow.votes = totalVotes;

                    //mark up the counts for the summary row by districts
                    summaryRow.lead = maxDistrictCount;
                    summaryRow.pnm = districtCounts["PNM"];
                    summaryRow.unc = districtCounts["UNC"];
                    summaryRow.cop = districtCounts["COP"];
                    summaryRow.ilp = districtCounts["ILP"];

                    var totalDistricts = new Array();
                    for (var j = 0; j < results.data.party_codes.length; j++) {
                        totalDistricts.push({code:results.data.party_codes[j], count:districtCounts[results.data.party_codes[j]]});
                    }
                    summaryRow.votes = totalDistricts;

                    tableRows.push(totalRow);  
                    //summaryRows.push(totalRow);
                    summaryRows.push(summaryRow);

                }

                var totalRCs = new Array();
                var maxRCCount =0;
                for (var j = 0; j < results.data.party_codes.length; j++) {
                    totalRCs.push({code:results.data.party_codes[j], count:rcCounts[results.data.party_codes[j]]});
                    if(rcCounts[results.data.party_codes[j]] > maxRCCount){
                        maxRCCount = rcCounts[results.data.party_codes[j]];
                    }
                }

                var rcLeadRow = {};
                //rcLeadRow

                rcLeadRow.rName = "Total City/ Borough/ Corporation";
                rcLeadRow.name = "Total City/ Borough/ Corporation";
                rcLeadRow.rRowSpan = 1;
                rcLeadRow.rShowName =1;
                
                rcLeadRow.num_in = total_in;
                rcLeadRow.num_ps_total = total_ps; 

                rcLeadRow.lead = maxRCCount;

                rcLeadRow.pnm = rcCounts["PNM"];
                rcLeadRow.unc = rcCounts["UNC"];
                rcLeadRow.cop = rcCounts["COP"];
                rcLeadRow.ilp = rcCounts["ILP"]; 
                rcLeadRow.votes = totalRCs;

                summaryRows.push(rcLeadRow);

                //Update the totals and station
                //the totals variable is setup 
                //by app.factory ('totals'... earlier
                totals.pnm = total_pnm;
                totals.unc = total_unc;
                totals.ilp = total_ilp;
                totals.cop = total_cop;
                totals.other = total_other;

                stations.ins = total_in;
                stations.total = total_ps;

                //console.log(tableData);

                //Bind tableData to html view via $scope.data
                //$scope.data = tableData;        
                $scope.data = tableRows;  
                $scope.summary = summaryRows;      
            });   
        });        
    };
    
    $scope.poll = function () {
        config.then(function (settings) {
            $interval($scope.initResults, settings.data.interval);    
        });
    };
    
    $scope.initResults();
    $scope.poll();        
});
