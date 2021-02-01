let CLASS_DEVICE_HOLDER = '.device-holder'

let Emitter = new EventEmitter();

class Device {

    constructor(id){
        this.id = id;
        this.value = {
            name: 'OV10XX',
            status: false,
            temperature: [NaN, NaN, NaN],
            digital: [0, 0, 0, 0, 0],
            digitalName: ['Fan 1', 'Fan 2', 'Fan 3', 'Exhaust', 'Alarm'],
            digitalState: [
                ['OFF','ON'],
                ['OFF','ON'],
                ['OFF','ON'],
                ['OFF','ON'],
                ['Warning!','OK'],
            ],
            digitalColor: [
                ['color-state-danger', 'color-state-normal'],
                ['color-state-danger', 'color-state-normal'],
                ['color-state-danger', 'color-state-normal'],
                ['color-state-danger', 'color-state-normal'],
                ['color-state-danger', 'color-state-normal'],
            ]
        };
        this.element = {
            parent: document.querySelector('.device-holder'),
            card: null,
            name: null,
            status: null,
            temperature: new Array(),
            digital: new Array(),        
        };
        this.init(id);
    }


    init(id) {
        this._createCard();
        this.element.parent.appendChild(this.element.card);
        Emitter.subscribe(`device@${id}`, (data) => {
            this._pushData(data);
            this._refresh();
        });
    }


    _pushData(data){
        if(data.id) this.id = data.id;
        if(data.name) this.value.name = data.name;
        if(data.temperature) data.temperature.forEach((t,idx) => {
            if(t>=999 || t<10){
                this.value.temperature[idx] = NaN;
            } else {
                this.value.temperature[idx] = t;
            }
        });

        if(data.digital) data.digital.forEach((d, idx) => {
            this.value.digital[idx] = d;
        });

        // check if sensor alive from timestamp
        if(data.timestamp) {
            const dataDate = Date.parse(data.timestamp);
            const serverTime = Date.parse(data.server_time);
            this.value.status = !( 
                serverTime - dataDate > DEVICE_TIMEOUT
            );
        }
    }


    _refresh() {
        // refresh name
        this.element.name.textContent = this.value.name;
        
        // refresh device status
        if(this.value.status){
            this.element.status.textContent = 'Online';
            this.element.status.classList.remove('color-state-danger');
            this.element.status.classList.add('color-state-normal');
        } else {
            this.element.status.textContent = 'Offline';
            this.element.status.classList.remove('color-state-normal');
            this.element.status.classList.add('color-state-danger');
        }

        // refresh temperature
        this.element.temperature.forEach((temp, index) => {
            temp.text.textContent = `Zone ${index+1}`;
            if(isNaN(this.value.temperature[index])){
                temp.value.textContent = "Err" 
            }
            else {
                temp.value.textContent = Math.round(this.value.temperature[index]);
            }
        });

        // refresh digital
        this.element.digital.forEach((digit, index) => {
            digit.text.textContent = this.value.digitalName[index];
            const digival = this.value.digital[index];
            digit.value.textContent = this.value.digitalState[index][digival];
            digit.value.parentElement.classList.remove(this.value.digitalColor[index][(digival+1)%2]);
            digit.value.parentElement.classList.add(this.value.digitalColor[index][digival]);
        });
    }


    _createCard() {

        this.element.card = document.createElement("section");
        const header = document.createElement("div");
        this.element.name = document.createElement("h3");
        this.element.status = document.createElement("h3");
        const measurement = document.createElement("div");
        const temperature = document.createElement("div");
        const digital = document.createElement("div");

        this.element.card.classList.add("device");
        header.classList.add("device-header");
        this.element.name.classList.add("device-name");
        this.element.status.classList.add("device-status");
        measurement.classList.add("device-measurement");
        temperature.classList.add("temperature");
        digital.classList.add("digital");

        header.appendChild(this.element.name);
        header.appendChild(this.element.status);

        for (let nZone = 0; nZone < this.value.temperature.length; nZone++) {    
            const newZone = this._createZone();
            temperature.appendChild(newZone.zone);
            this.element.temperature.push(newZone);
        }

        for (let nDigital = 0; nDigital < this.value.digital.length; nDigital++) {
            const newDigital = this._createDigital();
            digital.appendChild(newDigital.digitalStatus);
            this.element.digital.push(newDigital);
        }

        measurement.appendChild(temperature);
        measurement.appendChild(digital);
        this.element.card.appendChild(header);
        this.element.card.appendChild(measurement);

        this.element.card.addEventListener("click", () => {
            document.location.href = '/device.html?id=' + this.id;
        });

    }


    _createZone() {

        const zone = document.createElement("div");
        zone.classList.add("zone");
        const zoneText = document.createElement("h4");
        zoneText.classList.add("zone-text");
        const zoneValueHolder = document.createElement("div");
        const zoneValue = document.createElement("h4");
        zoneValueHolder.classList.add("zone-value");
        zoneValueHolder.appendChild(zoneValue);

        zone.appendChild(zoneText);
        zone.appendChild(zoneValueHolder);

        return {
            zone: zone,
            text: zoneText,
            value: zoneValue,
        }

    }


    _createDigital() {

        const digitalStatus = document.createElement("div");
        digitalStatus.classList.add("digital-status");
        const digitalStatusText = document.createElement("h4");
        digitalStatusText.classList.add("digital-status-text");
        const digitalStatusValueHolder = document.createElement("div");
        const digitalStatusValue = document.createElement("h4");
        digitalStatusValueHolder.classList.add("digital-status-value");
        digitalStatusValueHolder.appendChild(digitalStatusValue);

        digitalStatus.appendChild(digitalStatusText);
        digitalStatus.appendChild(digitalStatusValueHolder);

        return {
            digitalStatus: digitalStatus,
            text: digitalStatusText,
            value: digitalStatusValue,
        }

    }
};


let TimeAlarm = {

    eventListener: new EventEmitter(),

    init() {
        this.handleAPI();
        this.handleError();
        this.handleUI();
        this._createHTML();
        this._styling();
        console.log("init alarm");
        this.alarm = new SoundElement('./sound/mixkit-urgent-simple-tone-loop-2976.wav');
        this.eventListener.emit("API:GET UNFINISHED ANNEALING");
    },

    _createHTML() {
        this.alertElem = document.createElement('div');
        this.alertHead = document.createElement('h2');
        this.alertElem.appendChild(this.alertHead);
        this.alertHead.textContent = "WARNING!";
        this.alertOvenBody = document.createElement('h3');
        this.alertElem.appendChild(this.alertOvenBody);
        this.alertOvenBody.textContent = "OV0000";
        this.alertBody = document.createElement('h3');
        this.alertElem.appendChild(this.alertBody);
        this.alertBody.textContent = "Annealing Time Reached";
        this.button = new ButtonGroup({
            buttonConfigList: [
                {
                    text: 'OK',
                    callback: () => {
                        this.eventListener.emit("API:SET ISFINISHED");
                    },
                }
            ],
            parent: this.alertElem,
        })

        this.card = new HoverCard({
            parent: document.body,
            childs: [ this.alertElem ],
            style: {
                backgroundColor: 'yellow',
                width: 'max-content'
            }
        });
    },

    _styling() {
        this.alertElem.style.border = '10px dashed black';
        this.alertElem.style.padding = '1em';

        this.alertHead.style.textAlign = 'center';
        this.alertHead.style.margin = '1rem';
        this.alertHead.style.fontSize = '2em';
        this.alertHead.style.color = 'red';

        this.alertOvenBody.style.textAlign = 'center';
        this.alertOvenBody.style.margin = '.5rem 1rem';
        this.alertOvenBody.style.fontSize = '1.5em';
        this.alertOvenBody.style.color = 'black';

        this.alertBody.style.textAlign = 'center';
        this.alertBody.style.margin = '.5rem 1rem';
        this.alertBody.style.fontSize = '1.5em';
        this.alertBody.style.color = 'black';
    },

    enable({
        oven,
        text,
    }) {
        this.alertOvenBody.textContent = oven;
        this.alertBody.textContent = text;
        this.card.show();
        this.alarm.play();
    },

    disable() {
        this.card.hide();
        this.alarm.stop();
    },

    handleUI() {
        this.eventListener.subscribe("UI:SET ALARM", (data) => {
            this.doc = data;
            console.log(data);
            // get server time
            let serverTime = new Date(data.server_time);
            console.log(serverTime);
            // get starting time
            let startTime = new Date(data.start_date);
            console.log(startTime);
            // add with duration 1 & 2
            let endTime = new Date( 
                +startTime 
                + data.duration[0]
                + data.duration[1]
            );
            console.log(endTime);
            // compare with current time
            if(+endTime <= +serverTime) {
                console.log("TRIGGER ALARM");
                this.enable({
                    oven: data.furnace,
                    text: "Annealing time reached!"
                });
            } else {
                setTimeout(() => {
                    this.eventListener.emit("API:GET UNFINISHED ANNEALING");
                }, 5000);
            }
        });
    },

    handleAPI() {
        this.eventListener.subscribe("API:GET UNFINISHED ANNEALING", async () => {
            console.log("GET UNFINISHED ANNEALING");
            let res = await fetch(API_LINK + '/document?unfinished=true');
            if(res.ok) {
                this.eventListener.emit("API:PARSE GET UNFINISHED", res);
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:SET ISFINISHED", async () => {
            console.log("SET ISFINISHED ANNEALING");
            let data = {
                id: this.doc._id,
                isFinish: true,
            }
            let res = await fetch(API_LINK + '/document', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                this.disable();
                this.eventListener.emit("API:GET UNFINISHED ANNEALING");
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:PARSE GET UNFINISHED", async (data) => {
            res = await data.json();
            console.log(res);

            if(res.payload.length>0) {
                let rp = res.payload
                rp.sort((a,b) => {
                    let A_startTime = new Date(a.start_date);
                    let B_startTime = new Date(b.start_date);
                    let A_endTime = +A_startTime 
                        + a.duration[0]
                        + a.duration[1];
                    let B_endTime = +B_startTime 
                        + b.duration[0]
                        + b.duration[1];
                    return A_endTime - B_endTime;
                });
                rp[0].server_time = res.server_time;
                this.eventListener.emit("UI:SET ALARM", res.payload[0]);
            } else {
                setTimeout(() => {
                    this.eventListener.emit("API:GET UNFINISHED ANNEALING");
                }, 5000);
            }
        });
    },

    handleError() {
        this.eventListener.subscribe("ERROR", (e) => {
            console.error(e);
            this.errorViewer.set(e);
        })
    },

}


let Devices = {

    fetchResult : null,
    deviceIdList: new Array(),
    deviceObjList : new Array(),
    deviceParentElement : null,

    init() {
        Emitter.subscribe('event:fetch-success', () => {
            this._parseFetch();
        });
    },

    async update() {
        await this.fetchData()
        setTimeout(()=> {this.update()}, UPDATE_INTERVAL);
    },

    async fetchData() {
        try {
            const response = await fetch(API_LINK + '/device');
            if(response.ok) {
                this.fetchResult = await response.json();
                Emitter.emit('event:fetch-success');
            } else {
                Emitter.emit('error:response-status', response.status);
            }
        } catch (err) {
            Emitter.emit('error:fetch-data');
        }
    },

    _parseFetch() {
        if(this.fetchResult.success){
            
            let idList = this.fetchResult.payload.map(p => { return p._id });

            idList.forEach((id) => {
                if(this.deviceIdList.indexOf(id) == -1){
                    console.log("new", id);
                    this.deviceIdList.push(id);
                    this.deviceObjList.push(new Device(id));
                }
            });

            this.fetchResult.payload.forEach((p) => {
                let fetchdata = new Object();
                if(this.fetchResult.server_time) fetchdata.server_time = this.fetchResult.server_time;
                if(p._id) fetchdata.id = p._id;
                if(p.name) fetchdata.name = p.name;
                if(p.mac_address) fetchdata.mac_address = p.mac_address;
                if(p.last_measurement){
                    if(p.last_measurement.timestamp) fetchdata.timestamp = p.last_measurement.timestamp;
                    if(p.last_measurement.measurement.temperature) fetchdata.temperature = p.last_measurement.measurement.temperature;
                    if(p.last_measurement.measurement.digital) fetchdata.digital = p.last_measurement.measurement.digital;
                }
                Emitter.emit(`device@${p._id}`, fetchdata)
            });

        } else {
            console.log("error?");
        }
    }

}



document.addEventListener("DOMContentLoaded", async () => {

    // get query parameter
    let urlParams = new URLSearchParams(window.location.search);
    let urlParamsHideDoc = urlParams.get('hidedoc');


    errorViewer = document.querySelector('.error-viewer');
    errorViewerText = errorViewer.querySelector('.error-text');

    // error viewer
    Emitter.subscribe('error:fetch-data', () => {
        errorViewerText.textContent = "You are Offline! Please check your network connection."
        errorViewer.classList.remove('hidden');
    });
    Emitter.subscribe('error:response-status', () => {
        errorViewerText.textContent = "Error: Invalid response from server"
        errorViewer.classList.remove('hidden');
    });
    Emitter.subscribe('event:fetch-success', () => {
        errorViewer.classList.add('hidden');
    });


    const deviceHolder = document.querySelector(CLASS_DEVICE_HOLDER);
    Devices.deviceParentElement = deviceHolder;

    Devices.init();
    Devices.update();

    if(urlParamsHideDoc) {
        document.querySelector(".addition").style.display = "none";
    }

    // alarm
    TimeAlarm.init();

});