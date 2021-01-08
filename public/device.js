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
        var kalman = new KalmanFilter();
        if(data){
            this.temperatureChart.update({
                labels: timestamp.filter((_,i) => {return i % every === 0}),
                datasets: data.map((d,idx) => {
                    return d.filter((_,i) => {return i % every === 0}).map(d => {return kalman.filter(d)});
                })
            });
        }
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

            this.digitalChart.update({
                xLabels: timestamp.filter((_,i) => {return i % every === 0}),
                datasets: data.map((d,idx) => {
                    return d.filter((_,i) => {return i % every === 0});
                })
            });
        }
    },

    _createHTML(){
        // create holder
        this.elem.holder = document.createElement('section');
        this.elem.holder.classList.add('visualizer-holder');

        // create setting button
        this.elem.scaleBtn = new ClickableButton({
            config: {
                class: 'button-rescale',
                text: '',
                callback: () => {
                    location.pathname = '/scaler.html'
                }
            },
            parent: this.element()
        });
        this.elem.scaleBtn.element().innerHTML = 
        `<svg viewBox="0 0 426.667 426.667">
            <g>
                <g>
                    <path d="M416.8,269.44l-45.013-35.307c0.853-6.827,1.493-13.76,1.493-20.8s-0.64-13.973-1.493-20.8l45.12-35.307
                        c4.053-3.2,5.227-8.96,2.56-13.653L376.8,69.653c-2.667-4.587-8.213-6.507-13.013-4.587l-53.12,21.44
                        c-10.987-8.427-23.04-15.573-36.053-21.013l-8-56.533C265.653,3.947,261.28,0,255.947,0h-85.333c-5.333,0-9.707,3.947-10.56,8.96
                        l-8,56.533c-13.013,5.44-25.067,12.48-36.053,21.013l-53.12-21.44c-4.8-1.813-10.347,0-13.013,4.587L7.2,143.573
                        c-2.667,4.587-1.493,10.347,2.56,13.653l45.013,35.307c-0.853,6.827-1.493,13.76-1.493,20.8s0.64,13.973,1.493,20.8L9.76,269.44
                        c-4.053,3.2-5.227,8.96-2.56,13.653l42.667,73.92c2.667,4.587,8.213,6.507,13.013,4.587L116,340.16
                        c10.987,8.427,23.04,15.573,36.053,21.013l8,56.533c0.853,5.013,5.227,8.96,10.56,8.96h85.333c5.333,0,9.707-3.947,10.56-8.96
                        l8-56.533c13.013-5.44,25.067-12.48,36.053-21.013l53.12,21.44c4.8,1.813,10.347,0,13.013-4.587l42.667-73.92
                        C422.027,278.507,420.853,272.747,416.8,269.44z M213.28,288c-41.28,0-74.667-33.387-74.667-74.667S172,138.667,213.28,138.667
                        s74.667,33.387,74.667,74.667S254.56,288,213.28,288z"/>
                </g>
            </g>
        </svg>`

        // create back button
        this.elem.backBtn = new ClickableButton({
            config: {
                class: 'back-to-dashboard',
                text: 'ᐊ Back to Dashboard',
                callback: () => {
                    location.search = '';
                    location.pathname = '/';
                }
            },
            parent: this.element()
        });

        // create Device Name holder
        this.elem.nameText = document.createElement('h2');
        this.elem.nameText.classList.add('name-text');
        this.elem.nameText.textContent = 'OV10XX';
        this.element().appendChild(this.elem.nameText);

        // create temperature chart
        this.temperatureChart = new DataChart({
            parent: this.element(),
            height: '500px',
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
                        intersect: false,
                        callbacks: {
                            title: (tooltipItem, data) => {
                                let tstamp = data.labels[tooltipItem[0].index];
                                return new Date(tstamp).toLocaleString('id-ID');
                            }
                        }
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
                                max: 350
                            }
                        }]
                    },
                }
            }    
        });

        // create blower chart
        this.digitalChart = new DataChart({
            parent: this.element(),
            height: '200px',
            canvasConfig: {
                type: 'line',
                data:{
                    xLabels: [],
                    yLabels: ['Fan1', 'Fan2', 'Fan3', 'Exhaust', 'Status', 'OFF', ''],
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
                            title: (tooltipItem, data) => {
                                let tstamp = data.xLabels[tooltipItem[0].index];
                                return new Date(tstamp).toLocaleString('id-ID');
                            },
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
                    return;
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


DocumentHolder = {

    element(){
        return this.elem.holder;
    },

    init(parent){
        this.parent = parent;
        this.elem = new Object();
        this._createHTML();
    },

    _createHTML(){

        // create holder element
        this.elem.holder = document.createElement('div');
        this.elem.holder.classList.add('doc-holder');

        this.elem.title = document.createElement('h2');
        this.elem.title.textContent = "Documents";
        this.element().appendChild(this.elem.title);

        this.elem.list = document.createElement('div');
        this.elem.list.classList.add('doc-list');

        // add doc button
        this.elem.addDoc = document.createElement('div');
        this.elem.addDoc.classList.add('doc-card');
        this.elem.addDoc.classList.add('clickable');
        this.elem.addDoc.classList.add('hover-bloom');
        this.elem.addDoc.innerHTML = `
            <span class="plus radius" style="width:38px; height:38px;"></span>  
            <h2 style="margin-left: 10px">Add Document</h2>
        `
        this.elem.list.appendChild(this.elem.addDoc);
        this.elem.addDoc.addEventListener('click', () => {
            let url = new URL(location.origin);
            url.pathname = '/doc.html';
            url.search = location.search;
            location = url;
        })

        // create doc-card
        new DocumentCard({
            parent: this.elem.list,
            title: "A2012313"
        })
        new DocumentCard({
            parent: this.elem.list,
            title: "A2012314"
        })
        new DocumentCard({
            parent: this.elem.list,
            title: "A2012315"
        })

        this.element().appendChild(this.elem.list);
        this.parent.appendChild(this.element());

    }

}


document.addEventListener('DOMContentLoaded', async () => {

    // initialize everything
    loadingScreen = new LoadingScreen(document.body);
    VisualizerElement.init(document.body);
    DocumentHolder.init(document.body);

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
            every: 1
        });
        VisualizerElement.updateDigital({
            timestamp: measurementData.timestamp,
            data: measurementData.digital,
            every: 1
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