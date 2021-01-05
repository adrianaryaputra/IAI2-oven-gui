let CLASS_DEVICE_HOLDER = '.device-holder'

let Emitter = new EventEmitter();

let Device = (parent) => {
    return {

        id: -1,

        value: {
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
        },


        element: {
            parent: parent,
            card: null,
            name: null,
            status: null,
            temperature: new Array(),
            digital: new Array(),        
        },


        init(data) {
            this._createCard();
            this.element.parent.appendChild(this.element.card);
            this._pushData(data);
            this._refresh();
            return this;
        },


        update(newData) {
            this._pushData(newData);
            this._refresh();
        },


        selfRemove(){
            this.element.parent.removeChild(this.element.card);
        },


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
        },


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
        },


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

        },


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

        },


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

        },

    }
};


let Devices = {

    fetchResult : null,
    deviceFetchList : Object(),
    deviceObjList : Object(),
    deviceParentElement : null,

    init() {

        Emitter.subscribe('event:fetch-success', () => {

            this._parseFetch();
    
            // add new and update data
            for (const key in this.deviceFetchList) {
                if (this.deviceObjList.hasOwnProperty(key)) {
                    this.deviceObjList[key].update(this.deviceFetchList[key]);
                } else {
                    this.deviceObjList[key] = Device(this.deviceParentElement).init(this.deviceFetchList[key]);
                }
            }
    
            // remove unused device
            for (const key in this.deviceObjList) {
                if(!this.deviceFetchList.hasOwnProperty(key)) {
                    this.deviceObjList[key].selfRemove();
                    delete this.deviceObjList[key];
                }
            }
    
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

        if(this.fetchResult.success) {
            this.fetchResult.payload.forEach(p => {
                this.deviceFetchList[p._id] = Object();
                
                if(this.fetchResult.server_time) this.deviceFetchList[p._id].server_time = this.fetchResult.server_time;
                if(p._id) this.deviceFetchList[p._id].id = p._id;
                if(p.name) this.deviceFetchList[p._id].name = p.name;
                if(p.mac_address) this.deviceFetchList[p._id].mac_address = p.mac_address;
                if(p.last_measurement){
                    if(p.last_measurement.timestamp) this.deviceFetchList[p._id].timestamp = p.last_measurement.timestamp;
                    if(p.last_measurement.measurement.temperature) this.deviceFetchList[p._id].temperature = p.last_measurement.measurement.temperature;
                    if(p.last_measurement.measurement.digital) this.deviceFetchList[p._id].digital = p.last_measurement.measurement.digital;
                }
            });
        }

    }

}



document.addEventListener("DOMContentLoaded", async () => {


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

});