VisualizerElement = {

    parent: null,
    elem: new Object(),

    init(parent){
        this.parent = parent;
        this._createHTML();
    },

    element(){
        return this.elem.holder
    },

    setDeviceName(name){
        this.elem.nameText.textContent = name;
    },

    updateTemperature({timestamp, data, every=60}){

        this.temperatureChart.update({
            labels: timestamp.filter((_,i) => {return i % every === 0}),
            datasets: data.map((d,idx) => {
                return d.filter((_,i) => {return i % every === 0});
            })
        })
    },

    updateDigital({timestamp, data, every=60}){
        yLabel = this.digitalChart.getYLabel();
        if(data){
            data.forEach((d,idx) => {
                data[idx] = d.map((val) => {
                    if(val==1) return yLabel[idx];
                    else return 'OFF';
                })
            });
        }
        this.digitalChart.update({
            xLabels: timestamp.filter((_,i) => {return i % every === 0}),
            datasets: data.map((d,idx) => {
                return d.filter((_,i) => {return i % every === 0});
            })
        })
    },

    _createHTML(){
        // create holder
        this.elem.holder = document.createElement('section');
        this.elem.holder.classList.add('visualizer-holder');

        // create back button
        this.elem.backBtn = new ClickableButton({
            config: {
                class: 'back-to-dashboard',
                text: 'ᐊ Back to Dashboard',
                callback: () => {
                    location.pathname = '/';
                }
            },
            parent: this.element()
        })

        // create Device Name holder
        this.elem.nameText = document.createElement('h2');
        this.elem.nameText.classList.add('name-text');
        this.elem.nameText.textContent = 'OV10XX';
        this.element().appendChild(this.elem.nameText);

        // create temperature chart
        this.temperatureChart = new DataChart({
            parent: this.element(),
            height: '300px',
            canvasConfig: {
                type: 'line',
                data:{
                    labels: [],
                    datasets: [{
                        label: 'Zone 1',
                        borderColor: 'red',
                        backgroundColor: 'red',
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 2',
                        borderColor: 'green',
                        backgroundColor: 'green',
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 3',
                        borderColor: 'aqua',
                        backgroundColor: 'aqua',
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            type: 'time',time: {
                                displayFormats: {
                                  millisecond: 'kk:mm:ss.SS',
                                  second: 'kk:mm:ss',
                                  minute: 'ddd kk:mm',
                                  hour: 'ddd kk:mm',
                                  day: 'ddd DD',
                                  week: 'DD MMM',
                                  month: 'MMM YY',
                                  quarter: 'MMM YY',
                                  year: 'MMM YY',
                                }
                            },
                            ticks: {
                                major: {
                                    enabled: true,
                                    fontStyle: 'bold'
                                },
                                autoSkip: true,
                                autoSkipPadding: 50,
                                maxRotation: 0,
                                sampleSize: 100,
                            },
                            scaleLabel: {
                                display: true,
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'temperature °C'
                            },
                            ticks: {
                                beginAtZero: true,
                                max: 400
                            }
                        }]
                    },
                }
            }    
        });

        // create blower chart
        this.digitalChart = new DataChart({
            parent: this.element(),
            height: '170px',
            canvasConfig: {
                type: 'line',
                data:{
                    xLabels: [],
                    yLabels: ['Fan1', 'Fan2', 'Fan3', 'Exhaust', 'Status', 'OFF'],
                    datasets: [{
                        label: 'Fan 1',
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Fan 2',
                        borderColor: 'rgba(0,200,0,1)',
                        backgroundColor: 'rgba(0,200,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Fan 3',
                        borderColor: 'rgba(200,200,0,1)',
                        backgroundColor: 'rgba(200,200,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Exhaust',
                        borderColor: 'rgba(0,200,200,1)',
                        backgroundColor: 'rgba(0,200,200,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Alarm',
                        borderColor: 'rgba(200,0,0,1)',
                        backgroundColor: 'rgba(200,0,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'index',
                        axis: 'x',
                        intersect: false,
                        callbacks: {
                            label: (tooltipItem, data) => {
                                var label = data.datasets[tooltipItem.datasetIndex].label || '';
                                if(label) label += ': ';
                                if(tooltipItem.yLabel && tooltipItem.yLabel!="OFF"){
                                    label += 'ON';
                                } else {
                                    label += 'OFF';
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            type: 'time',time: {
                                displayFormats: {
                                  millisecond: 'kk:mm:ss.SS',
                                  second: 'kk:mm:ss',
                                  minute: 'ddd kk:mm',
                                  hour: 'ddd kk:mm',
                                  day: 'ddd DD',
                                  week: 'DD MMM',
                                  month: 'MMM YY',
                                  quarter: 'MMM YY',
                                  year: 'MMM YY',
                                }
                            },
                            ticks: {
                                major: {
                                    enabled: true,
                                    fontStyle: 'bold'
                                },
                                autoSkip: true,
                                autoSkipPadding: 50,
                                maxRotation: 0,
                                sampleSize: 100,
                            },
                            scaleLabel: {
                                display: true,
                            }
                        }],
                        yAxes: [{
                            type: 'category',
                            gridLines: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            scaleLabel: {
                                display: false,
                                labelString: 'state'
                            }
                        }]
                    },
                }
            }    
        });
        
        // append to parent
        this.parent.appendChild(this.element());
    },
}

async function fetchMeasurementData({macAddress, currentDate = Date.now()}){
    let fetchLink = new URL(API_LINK + '/measurement');
    fetchLink.search = new URLSearchParams({
        mac_address: macAddress,
        date_from: new Date(currentDate - (1000*60*60*48)).toISOString(),
        date_to: new Date(currentDate).toISOString()
    });

    try{
        const response = await fetch(fetchLink);
        if(response.ok){
            const fetchResult = await response.json();
            if(fetchResult.success){
                if(fetchResult.payload.length){
                    return {
                        timestamp: fetchResult.payload.map(p => {
                            if(p.timestamp) return p.timestamp 
                        }),
                        temperature: transpose(
                            fetchResult.payload.map(p => {
                                if(p.measurement){
                                    if(p.measurement.temperature){
                                        return p.measurement.temperature
                                    }
                                }
                            })
                        ),
                        digital: transpose(
                            fetchResult.payload.map(p => {
                                if(p.measurement){
                                    if(p.measurement.digital){
                                        return p.measurement.digital
                                    }
                                }
                            })
                        ),
                    }
                } else {
                    console.error(fetchResult);
                }
            } else {
                console.error(fetchResult);
                return;
            }
        } else {
            console.error(response.status);
            return;
        }
    } catch(err) {
        console.error(err);
        return;
    }
}

let transpose = a => a[0].map((_, c) => a.map(r => r[c]));

async function fetchDeviceData(id){
    let fetchLink = new URL(API_LINK + '/device');
    fetchLink.search = new URLSearchParams({
        id: id
    }).toString();

    try{
        const response = await fetch(fetchLink);
        if(response.ok){
            const fetchResult = await response.json();
            if(fetchResult.success){
                return {
                    ...fetchResult.payload[0],
                    server_time: fetchResult.server_time,
                    mac_address: fetchResult.payload[0].mac_address.map((mac) => {
                        return mac.toString(16).padStart(12,'0').match( /.{1,2}/g ).join('-')
                    })
                }
            } else {
                console.error(response);
                return;
            }
        } else {
            console.error(response.status);
            return;
        }
    } catch(err) {
        console.error(err);
        return;
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // initialize everything
    loadingScreen = new LoadingScreen(document.body);
    VisualizerElement.init(document.body);

    // set loading screen
    loadingScreen.set({
        title: "Obtaining Data",
        description: "Obtaining data... this may take a few second..."
    });
    loadingScreen.show();

    // get query data from windows
    let urlParams = new URLSearchParams(window.location.search);
    let urlParamsId = urlParams.get('id');

    // get device info
    let deviceData = await fetchDeviceData(urlParamsId);
    VisualizerElement.setDeviceName(deviceData.name);

    // get temperature data
    let measurementData = await fetchMeasurementData({
        macAddress: deviceData.mac_address[0],
        currentDate: Date.parse(deviceData.server_time)
    })

    // set chart data
    if(measurementData){
        VisualizerElement.updateTemperature({
            timestamp: measurementData.timestamp,
            data: measurementData.temperature,
            every: 5
        });
        VisualizerElement.updateDigital({
            timestamp: measurementData.timestamp,
            data: measurementData.digital,
            every: 5
        });
    } else {
        let timestamp48h = [
            new Date(
                Date.parse(deviceData.server_time)
                - 1000*60*60*48
            ),
            new Date(deviceData.server_time)
        ];
        VisualizerElement.updateTemperature({
            timestamp: timestamp48h
        });
        VisualizerElement.updateDigital({
            timestamp: timestamp48h
        });
    }
    loadingScreen.hide();

})