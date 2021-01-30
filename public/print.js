PrintElement = {

    init({
        parent = document.body,
        info = [],
        operator = {
            start: "",
            finish: "",
        },
        load = [],
        timestamp = [],
        temperature = [],
        digital = [],
    }={}){
        this.parent = parent;
        this.info = info;
        this.operator = operator;
        this.load = load;
        this._createHTML();
        this.updateTemperature({
            timestamp,
            data: temperature,
        });
        this.updateDigital({
            timestamp,
            data: digital,
        });
    },

    updateTemperature({timestamp, data}){
        if(data){
            this.temperatureChart.update({
                labels: timestamp,
                datasets: data,
            });
        }
    },

    updateDigital({timestamp, data}){
        yLabel = this.digitalChart.getYLabel();
        if(data){
            data.forEach((d,idx) => {
                data[idx] = d.map((val) => {
                    if(val==1) return yLabel[idx];
                    else return 'OFF';
                })
            });

            this.digitalChart.update({
                xLabels: timestamp,
                datasets: data,
            });
        }
    },

    element(){
        return this.elem.printArea;
    },

    _createHTML(){
        this.elem = new Object();
        this.elem.printArea = document.createElement('section');
        this.elem.printArea.classList.add('print-area');
        this.parent.appendChild(this.elem.printArea);
        this._createHeader();
        this._createInfo();
        this._createPlot();
        this._createTable();
        this._createFooter();
    },

    _createFooter(){
        this.elem.footerHolder = document.createElement('section');
        this.elem.footerHolder.classList.add('holder-footer');
        this.element().appendChild(this.elem.footerHolder);
        this.elem.footerHolder.innerHTML = `
            <div class="info-footer">
                <p class="info-label">Catatan</p>
                <p class="info-value-span underline"></p>
                <p class="info-label">Start Operator</p>
                <p class="info-value">${this.operator.start}</p>
                <p class="info-label">Finish Operator</p>
                <p class="info-value">${this.operator.finish}</p>
            </div>
            <div class="ttd">
                <div class="ttd-col">
                    <p class="ttd-title">Operator Annealing</p>
                    <div class="ttd-sign">
                    </div>
                </div>
                <div class="ttd-col">
                    <p class="ttd-title">Bagian Packing</p>
                    <div class="ttd-sign"></div>
                </div>
                <div class="ttd-col">
                    <p class="ttd-title">QC</p>
                    <div class="ttd-sign"></div>
                </div>
            </div>
        `;
    },

    _createTable(){
        this.loadTable = new Table({
            parent: this.element(),
            header: [
                "Position",
                "Roll No.",
                "Dimension (Tebal x Lebar x Panjang)",
                "Weight",
                "OD",
                "Alloy Type",
                "Remarks",
            ]
        });

        this.load.forEach(l => {
            this.loadTable.add(l);
        })
    },

    _createPlot(){
        this.temperatureChart = new DataChart({
            parent: this.element(),
            height: '50mm',
            globalColor: '#000',
            globalFontColor: '#000',
            globalFontSize: 10,
            canvasConfig: {
                type: 'line',
                data:{
                    labels: [],
                    datasets: [{
                        label: 'Zone 1',
                        borderColor: 'rgb(150,0,0)',
                        borderDash: [2,2],
                        borderWidth: 1,
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 2',
                        borderColor: 'rgb(0,150,0)',
                        borderWidth: 1,
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 3',
                        borderColor: 'rgb(0,0,150)',
                        borderDash: [8,8],
                        borderWidth: 1,
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
                        enabled: false,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: 'rgba(0,0,0,0.1)'
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
                                color: 'rgba(0,0,0,0.1)'
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
            height: '30mm',
            globalColor: '#000',
            globalFontColor: '#000',
            globalFontSize: 10,
            canvasConfig: {
                type: 'line',
                data:{
                    xLabels: [],
                    yLabels: ['Fan1', 'Fan2', 'Fan3', 'Exhaust', 'Status', 'OFF', ''],
                    datasets: [{
                        label: 'Fan 1',
                        borderColor: 'rgba(150,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Fan 2',
                        borderColor: 'rgba(0,150,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Fan 3',
                        borderColor: 'rgba(0,0,150,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Exhaust',
                        borderColor: 'rgba(150,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Alarm',
                        borderColor: 'rgba(0,150,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
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
                        enabled: false,
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                color: 'rgba(0,0,0,0.1)'
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
                                color: 'rgba(0,0,0,0.1)'
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
    },

    _createInfo(){
        this.elem.infoHolder = document.createElement('section');
        this.elem.infoHolder.classList.add('holder-info');
        this.element().appendChild(this.elem.infoHolder);

        this.info.forEach(col => {
            let info = document.createElement('div');
            info.classList.add('info');
            this.elem.infoHolder.appendChild(info);

            if(typeof col === 'object'){
                for (const key in col) {
                    let infoLabel = document.createElement('p');
                    infoLabel.classList.add('info-label');
                    infoLabel.textContent = key;
                    info.appendChild(infoLabel);
                    let infoValue = document.createElement('p');
                    infoValue.classList.add('info-value');
                    infoValue.textContent = col[key];
                    info.appendChild(infoValue);
                }
            }
        })
    },

    _createHeader(){
        this.elem.headerHolder = document.createElement('section');
        this.elem.headerHolder.classList.add('holder-header');
        this.elem.headerHolder.innerHTML = `
            <div class="header-logo">
                <img src="/img/favicon.png">
            </div>
            <div class="header-title">
                <h3>Annealing Treatment and Data Record</h3>
            </div>
            <div class="header-doc-num-head">
                <h3>Document No. / Revision</h3>
            </div>
            <div class="header-doc-num-body">
                <h3>IAI-ANL2-FM-0_/_</h3>
            </div>
            <div class="header-level-head">
                <h3>Level</h3>
            </div>
            <div class="header-level-body">
                <h3>4</h3>
            </div>
        `;
        this.element().appendChild(this.elem.headerHolder);
    },

}


Handles = {

    eventListener: new EventEmitter(),

    init() {
        this.handleError();
        this.handleAPI();
        this.handleParam();
    },

    handleError() {
        this.eventListener.subscribe("ERROR", (e) => {
            console.error(e);
            this.errorViewer.set(e);
        })
    },

    handleParam() {
        urlSrc = new URLSearchParams(location.search);
        newSrc = new URLSearchParams();
        newSrc.set('id', urlSrc.get('doc'));
        this.eventListener.emit("API:GET DOCUMENT", newSrc);
    },

    handleAPI() {
        this.eventListener.subscribe("API:GET DOCUMENT", async (docId) => {
            console.log("GET DOCUMENT " + API_LINK + '/document?' + docId);
            let res = await fetch(API_LINK + '/document?' + docId);
            if(res.ok) {
                console.log(res)
                this.eventListener.emit("API:PARSE DOCUMENT GET", res);
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:GET MEASUREMENT", async(searchParam) => {
            console.log("GET MEASUREMENT " 
                + API_LINK 
                + '/measurement?' 
                + searchParam);
            let res = await fetch(API_LINK 
                + '/measurement?' 
                + searchParam);
            if(res.ok) {
                this.eventListener.emit("API:PARSE MEASUREMENT GET", res);
            } else {
                console.error(res);
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        })

        this.eventListener.subscribe("API:PARSE MEASUREMENT GET", async(res) => {
            data = await res.json();
            console.log(data);
        })

        this.eventListener.subscribe("API:PARSE DOCUMENT GET", async (data) => {
            res = await data.json();
            console.log(res);
            this.eventListener.emit("UI:SHOW DOC", res.payload[0]);

            // get measurement
            let measParam = new URLSearchParams();
            measParam.set("mac_address", res.payload[0].mac_address);
            measParam.set("date_from", new Date(res.payload[0].start_date).toISOString());
            measParam.set("date_to", new Date(
                +(new Date(res.payload[0].start_date))
                + res.payload[0].duration[0]
                + res.payload[0].duration[1]
                + res.payload[0].cooling).toISOString());

            this.eventListener.emit("API:GET MEASUREMENT",measParam);
        })
    },

}


function t2duration(stamp) {
    let hr = Math.floor(stamp/1000/60/60);
    let stmin = stamp - hr*60*60*1000;
    let min = Math.floor(stmin/1000/60);
    return `${hr}hr ${min}min`;
}


function load2table(load) {
    // ["FLT1", "?????", "0.13 x 210 x 4800", "4273", "711", "A8011", "-"],
    return load.map(l => {
        return [
            l.position,
            l.roll_num,
            `${l.dimension.thick}μ x ${l.dimension.width}mm x ${l.dimension.length}`,
            l.weight,
            l.od,
            l.alloy_type,
            l.remark
        ]
    })
}


function load2weight(load) {
    var red = load.reduce((acc, cur) => {
        console.log(cur.weight);
        return acc + cur.weight
    }, 0)
    console.log(red);
    return red;
}


document.addEventListener("DOMContentLoaded", () => {

    Handles.init();

    LoadingScreen = new LoadingScreen(document.body);

    LoadingScreen.set({
        title: "Obtaining Data",
        description: "Obtaining data... this may take a few second...",
    });

    Handles.eventListener.subscribe("UI:SHOW DOC", doc => {

        console.log(doc)
        
        PrintElement.init({
            info: [
                {
                    "Lot No.": `A${doc.lot_num}`,
                    "SPK No.": doc.spk_num,
                    "SPK Date": (new Date(doc.spk_date)).toLocaleDateString('id-ID'),
                    "Furnace No.": doc.furnace,
                    "Type": doc.special ? "Special Order" : "Standard Order",
                    "Temper": doc.temper,
                    "Roll Count": `${doc.load.length} pcs`,
                    "Total Weight": `${load2weight(doc.load)} kg`,
                }, {
                    "Start Time": (new Date(doc.start_date)).toLocaleString('en-IE', {timeZone: 'Asia/Jakarta'}),
                    "Finish Time": new Date(
                                   +(new Date(doc.start_date))
                                   + doc.duration[0]
                                   + doc.duration[1]
                                   + doc.cooling
                                   ).toLocaleString('en-IE', {timeZone: 'Asia/Jakarta'}),
                    "Temperature 1": `${doc.temperature[0]}°C`,
                    "Duration 1": t2duration(doc.duration[0]),
                    "Temperature 2": `${doc.temperature[1]}°C`,
                    "Duration 2": t2duration(doc.duration[1]),
                    "Cooling Time": t2duration(doc.cooling),
                }
            ],
            load: load2table(doc.load),
            operator: {
                start: doc.operator.start,
                finish: doc.operator.finish,
            },
            // timestamp: [
            //     new Date(0),
            //     new Date(100000),
            //     new Date(200000),
            //     new Date(300000),
            //     new Date(400000),
            //     new Date(500000),
            //     new Date(600000),
            //     new Date(700000),
            //     new Date(800000),
            //     new Date(900000),
            // ],
            // temperature: [
            //     [50, 53, 70, 93, 120, 165, 205, 201, 206, 180],
            //     [53, 50, 73, 95, 125, 160, 203, 203, 206, 180],
            //     [55, 55, 75, 90, 123, 163, 200, 201, 204, 180],
            // ],
            // digital: [
            //     [0,0,0,0,1,1,1,1,1,0],
            //     [0,0,0,0,1,1,1,1,1,0],
            //     [0,0,0,1,1,1,1,1,0,0],
            //     [0,0,0,1,1,1,1,1,0,0],
            //     [0,0,0,0,1,1,1,1,1,0],
            // ],
        });

    });

});