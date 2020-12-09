const API_PORT = "5000";
const API_VERSION = 0;
const API_LINK = 
    document.location.protocol + '//' 
    + document.location.hostname + ':'
    + API_PORT + `/APIv${API_VERSION}`

function returnHome(){
    location.href = location.origin;
}

LoadingScreen = {

    elem: new Object(),

    element(){
        return this.elem.holder;
    },

    init(parent){

        this.parent = parent;
        this.elem.holder = document.createElement('section');
        this.elem.holder.classList = "loading-holder hidden";

        this.elem.fullscreen = document.createElement('div');
        this.elem.fullscreen.classList = "loading-full";

        this.elem.spinner = document.createElement('div');
        this.elem.spinner.classList = "lds-ripple";
        this.elem.spinner.innerHTML = "<div></div><div></div>";
        this.elem.fullscreen.appendChild(this.elem.spinner);

        this.elem.textholder = document.createElement('div');
        this.elem.textholder.classList = "loading-text";

        this.elem.title = document.createElement('h2');
        this.elem.title.classList = "loading-title";
        this.elem.textholder.appendChild(this.elem.title);

        this.elem.description = document.createElement('h3');
        this.elem.description.classList = "loading-description";
        this.elem.textholder.appendChild(this.elem.description);

        this.set();

        this.elem.fullscreen.appendChild(this.elem.textholder);
        this.elem.holder.appendChild(this.elem.fullscreen);
        this.parent.appendChild(this.elem.holder);

    },

    show(){
        this.element().classList.remove('hidden');
    },

    hide(){
        this.element().classList.add('hidden');
    },

    set({
        title = 'Loading Title',
        description = 'Loading Decription.. very very long...'
    } = {}){
        this.elem.title.textContent = title;
        this.elem.description.textContent = description;
    }

}


class TemperatureCard{

    constructor(parent, isEditable = false){
        this.parent = parent;
        this.measurement = null;
        this.editable = isEditable;
        this.elem = new Object();
        this._generateHTML();
    }

    set(measurement){
        this.value = parseFloat(measurement);
        if(isNaN(this.measurement)){
            this.elem.measurement.textContent = '---';
        } else {
            this.elem.measurement.textContent = this.value;
        }
    }

    get(){
        return this.value;
    }

    getRef(){
        return this.elem.reference.textContent;
    }

    element(){
        return this.elem.card;
    }

    _generateHTML(){
        this.elem.card = document.createElement("div");
        this.elem.card.classList.add("temp-card");

        this.elem.reference = document.createElement("h3");
        this.elem.reference.contentEditable = true;
        this.elem.reference.textContent = '0';

        this.elem.measurement = document.createElement("h3");
        this.set(NaN);
        
        if(this.editable){
            this.elem.card.appendChild(this.elem.reference);
            this.elem.measurement.classList.add('temp-multi');
            this.elem.reference.classList.add('temp-multi');
        }

        this.elem.card.appendChild(this.elem.measurement);
        this.parent.appendChild(this.elem.card);
    }

}


class ClickableButton{

    constructor({
        config, 
        parent = null
    }){
        this.config = config;
        this.elem = document.createElement("div");
        this.elem.className = this.config.class;
        this.elem.textContent = this.config.text;
        this.elem.addEventListener('click', this.config.callback);
        if(parent) parent.appendChild(this.elem);
    }

    element(){
        return this.elem
    }

}


class ButtonGroup{

    constructor({
        buttonConfigList = [],
        parent = null,
    }){
        this.button = new Array();
        this.elem = new Object();
        this.elem.holder = document.createElement("div");
        this.elem.holder.classList.add("temp-config-button");

        buttonConfigList.forEach((btnConfig) => {
            this.button.push(
                new ClickableButton({
                    config: btnConfig,
                    parent: this.elem.holder,
                })
            );
        });

        if(parent) parent.appendChild(this.element());
    }

    element(){
        return this.elem.holder
    }

}


class TemperatureViewer{

    constructor({
        parent, 
        numberOfCard, 
        title, 
        button = [],
        isEditable = false,
    }){
        this.isEditable = isEditable;
        this.parent = parent;
        this.title = title;
        this.temperatureCard = new Array(numberOfCard);
        this.editableCard = new Array(numberOfCard);
        this.arrayValue = null;
        this.elem = new Object();
        this.buttonConfig = button;
        this._generateHTML();
    }

    setTitle(title = this.title){
        this.elem.title.textContent = title;
    }

    setTemp(tempList){
        tempList.forEach((t, index) => {
            this.temperatureCard[index].set(t);
        })
    }

    getTemp(){
        return this.temperatureCard.map((temp) => parseFloat(temp.get()));
    }

    getRefTemp(){
        return this.temperatureCard.map((temp) => parseFloat(temp.getRef()));
    }

    element(){
        return this.elem.holder;
    }

    _generateHTML(){
        this.elem.holder = document.createElement("div");
        this.elem.holder.classList.add("temperature-viewer");
        this.elem.title = document.createElement("h3");
        this.setTitle();
        this.elem.holder.appendChild(this.elem.title);
        this.elem.tempHolder = document.createElement("div");
        this.elem.tempHolder.classList.add("temp-card-holder");
        this._generateTempCard();
        this.elem.holder.appendChild(this.elem.tempHolder);
        new ButtonGroup({
            buttonConfigList: this.buttonConfig,
            parent: this.element(),
        })
        this.parent.appendChild(this.elem.holder);
    }

    _generateTempCard(){
        for (let nCard = 0; nCard < this.temperatureCard.length; nCard++) {
            this.temperatureCard[nCard] = new TemperatureCard(this.elem.tempHolder, this.isEditable);
        }
    }

}


let ScalerHolder = {

    elem: new Object(),
    tempCurrent: null,
    tempAtLow: null,
    tempAtHigh: null,

    element(){
        return this.elem.holder;
    },

    setName(name){
        this.elem.name.textContent = name;
    },

    setTemperature(temp){
        this.tempCurrent.setTemp(temp);
    },

    init(parent){

        this.elem.holder = document.createElement('section');
        this.elem.holder.classList.add('scaler-holder');

        let backButton = new ClickableButton({
            config: {
                class: 'back-to-device',
                text: 'ᐊ Back to Device',
                callback: () => {

                    let result = {
                        mac_address: APIConnector.macAddress,
                        scaler:{
                            gain: APIConnector.oldScale.gain[nT],
                            shift: APIConnector.oldScale.shift[nT],
                        },
                        refresh_time: 60
                    }

                    console.log(result);
                    await APIConnector.update(result);

                    returnHome();
                }
            },
            parent: this.element()
        });

        this.elem.name = document.createElement('h2');
        this.elem.name.classList.add('device-name-label');
        this.elem.name.textContent = "OV10XX";
        this.elem.holder.appendChild(this.elem.name);

        this.tempCurrent = new TemperatureViewer({
            parent: this.element(),
            numberOfCard: 3,
            title: "Current Temperature",
        });

        this.tempAtLow = new TemperatureViewer({
            parent: this.element(),
            numberOfCard: 3,
            title: "Temperature scale Low",
            isEditable: true,
            button: [
                {
                    class: 'color-state-normal',
                    text: 'SET current temperature',
                    callback: () => {
                        let currTemp = this.tempCurrent.getTemp();
                        this.tempAtLow.setTemp(currTemp);
                    },
                },
                {
                    class: 'color-state-danger',
                    text: 'RESET to reference',
                    callback: () => {
                        let refTempLow = this.tempAtLow.getRefTemp();
                        this.tempAtLow.setTemp(refTempLow);
                    },
                }
            ],
        });
        let refTempLow = this.tempAtLow.getRefTemp();
        this.tempAtLow.setTemp(refTempLow);

        this.tempAtHigh = new TemperatureViewer({
            parent: this.element(),
            numberOfCard: 3,
            title: "Temperature scale High",
            isEditable: true,
            button: [
                {
                    class: 'color-state-normal',
                    text: 'SET current temperature',
                    callback: () => {
                        let currTemp = this.tempCurrent.getTemp();
                        this.tempAtHigh.setTemp(currTemp);
                    },
                },
                {
                    class: 'color-state-danger',
                    text: 'RESET to reference',
                    callback: () => {
                        let refTempHigh = this.tempAtHigh.getRefTemp();
                        this.tempAtHigh.setTemp(refTempHigh);
                    },
                }
            ],
        });
        let refTempHigh = this.tempAtHigh.getRefTemp();
        this.tempAtHigh.setTemp(refTempHigh);

        this.submitButton = new ButtonGroup({
            buttonConfigList: [
                {
                    text: 'Submit temperature rescale',
                    callback: async () => {

                        LoadingScreen.set({
                            title: 'Submitting Data',
                            description: 'submitting changes to device...'
                        });
                        LoadingScreen.show();

                        let tInLow = this.tempAtLow.getTemp();
                        let tInHigh = this.tempAtHigh.getTemp();
                        let tOutLow = this.tempAtLow.getRefTemp();
                        let tOutHigh = this.tempAtHigh.getRefTemp();
                        let tLength = Math.min(
                            tInLow.length,
                            tInHigh.length 
                        );

                        let tResult = new Array(tLength);
                        for(nT=0; nT<tLength; nT++){
                            tResult[nT] = calculateGainShift({
                                tempInLow: tInLow[nT],
                                tempInHigh: tInHigh[nT],
                                tempOutLow: tOutLow[nT],
                                tempOutHigh: tOutHigh[nT],
                                oldGain: APIConnector.oldScale.gain[nT],
                                oldShift: APIConnector.oldScale.shift[nT]
                            })
                        }

                        let result = {
                            mac_address: APIConnector.macAddress,
                            scaler:{
                                gain: tResult.map((v) => {return v.gain}),
                                shift: tResult.map((v) => {return v.shift}),
                            },
                            refresh_time: 60
                        }

                        console.log(result);
                        await APIConnector.update(result);

                        LoadingScreen.hide();
                        returnHome();

                    }
                },
                {
                    class: "back-to-device color-state-danger",
                    text: 'RESET Scaler',
                    callback: async () => {

                        LoadingScreen.set({
                            title: 'Submitting Data',
                            description: 'submitting changes to device...'
                        });
                        LoadingScreen.show();

                        let result = {
                            mac_address: APIConnector.macAddress,
                            scaler:{
                                gain: [1, 1, 1],
                                shift: [0, 0, 0],
                            },
                            refresh_time: 60
                        }

                        console.log(result);
                        await APIConnector.update(result);

                        LoadingScreen.hide();
                        returnHome();

                    }
                }
            ],
            parent: this.element(),
        })

        parent.appendChild(this.element());

    }

}


function calculateGainShift({
    tempInLow,
    tempInHigh,
    tempOutLow,
    tempOutHigh,
    oldGain,
    oldShift,
}){
    let rawTempInLow = (tempInLow - oldShift) / oldGain;
    let rawTempInHigh = (tempInHigh - oldShift) / oldGain;

    let gain = (tempOutHigh - tempOutLow) / 
               (rawTempInHigh - rawTempInLow);
    
    let shift = tempOutLow - (gain * rawTempInLow);

    return {
        gain,
        shift,
    }
}


APIConnector = {

    apiLink: API_LINK,

    async refresh(){
        fetchResult = await this._fetchGetDevice(this._getQuery('id'))
        if(fetchResult){

            // console.log(fetchResult);

            if(fetchResult.last_measurement){

                if(
                    Date.parse(fetchResult.server_time) 
                    - Date.parse(fetchResult.last_measurement.timestamp)
                    < 2000
                ){
                    LoadingScreen.hide();
                }

                ScalerHolder.setTemperature(
                    fetchResult.last_measurement.measurement.temperature
                );
            }

            ScalerHolder.setName(fetchResult.name);
            this.macAddress = fetchResult.mac_address.map((mac) => {
                return mac.toString(16).padStart(12,'0').match( /.{1,2}/g ).join('-')
            });
            this.oldScale = fetchResult.scaler;

        } else {
            console.error('empty fetchResult', fetchResult);
        }
    },

    async update(data){

        let fetchLink = new URL(this.apiLink + '/measurement/sensor');

        try{

            const response = await fetch(fetchLink, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            })

            return response;

        } catch(err) {
            console.error(err, response);
        }

    },

    _getQuery(queryName){
        urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(queryName);
    },

    async _fetchGetDevice(deviceId){

        let fetchLink = new URL(this.apiLink + '/device');
        fetchLink.search = new URLSearchParams({
            id: deviceId
        }).toString();

        try{
            const response = await fetch(fetchLink);
            if(response.ok){
                const fetchResult = await response.json();
                return this._filterGetDevice(fetchResult);
            } else {
                console.error(response.status);
            }
        } catch(err) {
            console.error(err);
        }

    },

    _filterGetDevice(response){

        if(response.success){
            return {
                server_time: response.server_time,
                ... response.payload[0]
            }
        } else {
            console.error(response);
        }
    },

}


document.addEventListener("DOMContentLoaded", async () => {

    // initialize everything
    LoadingScreen.init(document.body);
    ScalerHolder.init(document.body);
    
    // set loading screen
    LoadingScreen.set({
        title: "Connecting to device",
        description: "Establishing connection with device... this may take up to a minute..."
    });
    LoadingScreen.show();

    // update
    APIConnector.refresh().then(() => {
        APIConnector.update({
            refresh_time: 2,
            mac_address: APIConnector.macAddress,
            scaler: APIConnector.oldScale
        });
    })
    setInterval(() => {APIConnector.refresh()}, 2000);

});