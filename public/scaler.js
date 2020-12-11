function returnHome(){
    location.href = location.origin;
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
                callback: async () => {

                    let result = {
                        mac_address: APIConnector.macAddress,
                        scaler:{
                            gain: APIConnector.oldScale.gain,
                            shift: APIConnector.oldScale.shift,
                        },
                        refresh_time: DEVICE_TIMEOUT
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

                        loadingScreen.set({
                            title: 'Submitting Data',
                            description: 'submitting changes to device...'
                        });
                        loadingScreen.show();

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
                            refresh_time: DEVICE_TIMEOUT
                        }

                        console.log(result);
                        await APIConnector.update(result);

                        loadingScreen.hide();
                        returnHome();

                    }
                },
                {
                    class: "back-to-device color-state-danger",
                    text: 'RESET Scaler',
                    callback: async () => {

                        loadingScreen.set({
                            title: 'Submitting Data',
                            description: 'submitting changes to device...'
                        });
                        loadingScreen.show();

                        let result = {
                            mac_address: APIConnector.macAddress,
                            scaler:{
                                gain: [1, 1, 1],
                                shift: [0, 0, 0],
                            },
                            refresh_time: DEVICE_TIMEOUT
                        }

                        console.log(result);
                        await APIConnector.update(result);

                        loadingScreen.hide();
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
                    <= UPDATE_INTERVAL
                ){
                    loadingScreen.hide();
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
    loadingScreen = new LoadingScreen(document.body);
    ScalerHolder.init(document.body);
    
    // set loading screen
    loadingScreen.set({
        title: "Connecting to device",
        description: "Establishing connection with device... this may take up to a minute..."
    });
    loadingScreen.show();

    // update
    APIConnector.refresh().then(() => {
        APIConnector.update({
            refresh_time: UPDATE_INTERVAL,
            mac_address: APIConnector.macAddress,
            scaler: APIConnector.oldScale
        });
    })
    setInterval(() => {APIConnector.refresh()}, UPDATE_INTERVAL);

});