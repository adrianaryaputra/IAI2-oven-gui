const API_PORT = "5000";
const API_VERSION = 0;
const API_LINK = 
    'http://' + document.location.hostname + ':'
    + API_PORT + `/APIv${API_VERSION}`;
const DEVICE_TIMEOUT = 60000 //ms
const UPDATE_INTERVAL = 10000 //ms

class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    emit(eventName, data) {
        const event = this.events[eventName];
        if( event ) {
            event.forEach(fn => {
                fn.call(null, data);
            });
        }
    }
    
    subscribe(eventName, fn) {
        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }
        
        this.events[eventName].push(fn);
        return () => {
            this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
        }
    }
}


class LoadingScreen{

    element(){
        return this.elem.holder;
    }

    constructor(parent){

        this.elem = new Object;
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

    }

    show(){
        this.element().classList.remove('hidden');
    }

    hide(){
        this.element().classList.add('hidden');
    }

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
        this.elem.className = 'clickable ' + this.config.class;
        this.elem.textContent = this.config.text || '';
        this.elem.style.cursor = 'pointer';
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
        this.elem.holder.classList.add("button-group");

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


class DataChart{

    constructor({
        parent,
        height = '400px',
        canvasConfig
    }){
        this.parent = parent;
        this.canvasHeight = height;
        this.elem = new Object();
        this._generateHTML();
        this.chart = new Chart(this.elem.canvas, canvasConfig);
        Chart.defaults.global.defaultColor = 'white';
        Chart.defaults.global.defaultFontColor = 'white';
        Chart.defaults.global.defaultFontSize = 16;
    }

    element(){
        return this.elem.holder;
    }

    _generateHTML(){
        // create holder
        this.elem.holder = document.createElement('section');
        this.elem.holder.classList.add('chart-holder');

        this.elem.canvas = document.createElement('canvas');
        if(this.canvasHeight) this.elem.canvas.style.height = this.canvasHeight;
        this.element().appendChild(this.elem.canvas);

        this.parent.appendChild(this.element());
    }

    getYLabel(){
        return this.chart.data.yLabels;
    }

    update({
        labels,
        xLabels,
        yLabels,
        datasets = []
    }){
        if(labels) this.chart.data.labels = labels;
        if(xLabels) this.chart.data.xLabels = xLabels;
        if(yLabels) this.chart.data.yLabels = yLabels;
        datasets.forEach((data, idx) => {
            this.chart.data.datasets[idx].data = data;
        });
        this.chart.update();
    }

}



class DocumentCard{

    constructor({
        parent = document.body,
        title = 'AYYMMXXX'
    }){
        this.parent = parent;
        this.elem = new Object();
        this.title = title; 
        this._createElement();
    }

    element(){
        return this.elem.card;
    }

    _createElement(){
        this.elem.card = document.createElement('div');
        this.elem.card.classList.add('doc-card');

        this.elem.titleHolder = document.createElement('div');
        this.elem.titleHolder.classList.add('holder-title');

        this.elem.title = document.createElement('h2');
        this.elem.title.textContent = this.title;
        this.elem.titleHolder.appendChild(this.elem.title);

        this.elem.date = document.createElement('h3');
        this.elem.date.textContent = new Date().toLocaleString();
        this.elem.titleHolder.appendChild(this.elem.date);

        this.elem.buttonHolder = document.createElement('div');
        this.elem.buttonHolder.classList.add('holder-button');

        this.buttonGroup = new ButtonGroup({
            buttonConfigList: [
                {
                    class: 'color-state-normal',
                    text: "View"
                },
                {
                    class: 'color-state-warning',
                    text: "Print"
                },
                {
                    class: 'color-state-danger',
                    text: "Delete"
                }
            ],
            parent: this.elem.buttonHolder
        })

        this.elem.card.appendChild(this.elem.titleHolder);
        this.elem.card.appendChild(this.elem.buttonHolder);
        this.parent.appendChild(this.element());
    }

}