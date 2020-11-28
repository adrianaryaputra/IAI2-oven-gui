let API_PORT = 5000;
let API_VERSION = 0;
let API_LINK = `http://${document.location.hostname}:${API_PORT}/APIv${API_VERSION}`;
let DEVICE_TIMEOUT = 60000 //ms
let UPDATE_INTERVAL = 10000 //ms

let CLASS_DEVICE_HOLDER = '.device-holder'

let Device = (parent) => {
    return {

        id: -1,

        value: {
            name: 'OV????',
            status: false,
            temperature: [0, 0, 0],
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
                ['color-state-warning', 'color-state-normal'],
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
                this.value.temperature[idx] = t;
            });

            if(data.digital) data.digital.forEach((d, idx) => {
                this.value.digital[idx] = d;
            });

            // check if sensor alive from timestamp
            if(data.timestamp) {
                const currDate = new Date(data.timestamp);
                this.value.status = !( 
                    Date.now() - currDate.getTime() > DEVICE_TIMEOUT
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
                temp.value.textContent = this.value.temperature[index];
            });

            // refresh digital
            this.element.digital.forEach((digit, index) => {
                digit.text.textContent = this.value.digitalName[index];
                const digival = this.value.digital[index];
                digit.value.textContent = this.value.digitalState[index][digival];
                digit.value.classList.remove(this.value.digitalColor[index][(digival+1)%2]);
                digit.value.classList.add(this.value.digitalColor[index][digival]);
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

        },


        _createZone() {

            const zone = document.createElement("div");
            zone.classList.add("zone");
            const zoneText = document.createElement("h4");
            zoneText.classList.add("zone-text");
            const zoneValue = document.createElement("h4");
            zoneValue.classList.add("zone-value");

            zone.appendChild(zoneText);
            zone.appendChild(zoneValue);

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
            const digitalStatusValue = document.createElement("h4");
            digitalStatusValue.classList.add("digital-status-value");

            digitalStatus.appendChild(digitalStatusText);
            digitalStatus.appendChild(digitalStatusValue);

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

    async update() {

        await this._fetchData();
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
            }
        }

    },

    async _fetchData() {

        const response = await fetch(API_LINK + '/device');

        if(response.ok) {
            this.fetchResult = await response.json();
        } else {
            alert("HTTP ERROR :" + response.status);
        }

    },

    _parseFetch() {

        if(this.fetchResult.success) {
            this.fetchResult.payload.forEach(p => {
                this.deviceFetchList[p._id] = Object();
                
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


document.addEventListener("DOMContentLoaded", () => {

    Devices.deviceParentElement = document.querySelector(CLASS_DEVICE_HOLDER)
    Devices.update();

    setInterval(() => {
        Devices.update();
    }, UPDATE_INTERVAL);

});