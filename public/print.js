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
        })
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
                        <p>${this.operator.finish}</p>
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
            globalFontSize: 9,
            canvasConfig: {
                type: 'line',
                data:{
                    labels: [],
                    datasets: [{
                        label: 'Zone 1',
                        borderColor: 'black',
                        borderDash: [2,2],
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 2',
                        borderColor: 'grey',
                        fill: false,
                        lineTension: 0,
                        pointRadius: 0,
                        data: [],
                    },{
                        label: 'Zone 3',
                        borderColor: 'black',
                        borderDash: [8,8],
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
            globalFontSize: 9,
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
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Fan 3',
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Exhaust',
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
                        fill: false,
                        pointRadius: 0,
                        lineTension: 0,
                        data: [],
                    },{
                        label: 'Alarm',
                        borderColor: 'rgba(0,0,0,1)',
                        backgroundColor: 'rgba(0,0,0,1)',
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

document.addEventListener("DOMContentLoaded", () => {

    LoadingScreen = new LoadingScreen(document.body);

    LoadingScreen.set({
        title: "Obtaining Data",
        description: "Obtaining data... this may take a few second...",
    });

    PrintElement.init({
        info: [
            {
                "Lot No.": "A12342135",
                "SPK No.": "001/IX/1/20/345",
                "SPK Date": "2020/12/21",
                "Furnace No.": "OV0007",
            }, {
                "Temper": "H0",
                "Start Time": "2020/12/21 13:00",
                "Finish Time": "2020/12/23 13:00",
                "Duration": "48h 00m",
            }
        ],
        load: [
            ["FLT1", "?????", "0.13 x 210 x 4800", "4273", "A8011", "-"],
            ["BLT1", "?????", "0.13 x 210 x 4900", "4472", "A8011", "-"],
            ["FLT2", "?????", "0.13 x 210 x 4850", "4353", "A8011", "-"],
        ],
        operator: {
            start: "Nama Operator Start",
            finish: "Nama Operator Finish",
        },
        timestamp: [
            new Date(0),
            new Date(100000),
            new Date(200000),
            new Date(300000),
            new Date(400000),
            new Date(500000),
            new Date(600000),
            new Date(700000),
            new Date(800000),
            new Date(900000),
        ],
        temperature: [
            [50, 53, 70, 93, 120, 165, 205, 201, 206, 180],
            [53, 50, 73, 95, 125, 160, 203, 203, 206, 180],
            [55, 55, 75, 90, 123, 163, 200, 201, 204, 180],
        ],
        digital: [
            [0,0,0,0,1,1,1,1,1,0],
            [0,0,0,0,1,1,1,1,1,0],
            [0,0,0,1,1,1,1,1,0,0],
            [0,0,0,1,1,1,1,1,0,0],
            [0,0,0,0,1,1,1,1,1,0],
        ],
    });

    window.print();

});