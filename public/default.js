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
        globalColor = 'white',
        globalFontColor = 'white',
        globalFontSize = 16,
        canvasConfig
    }){
        this.parent = parent;
        this.canvasHeight = height;
        this.elem = new Object();
        this._generateHTML();
        this.chart = new Chart(this.elem.canvas, canvasConfig);
        Chart.defaults.global.defaultColor = globalColor;
        Chart.defaults.global.defaultFontColor = globalFontColor;
        Chart.defaults.global.defaultFontSize = globalFontSize;
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
                    text: "Print",
                    callback: () => {
                        let url = new URL(location.origin);
                        url.pathname = "/print.html";
                        url.search = "";

                        window.open(url, '_blank', "toolbar=no");
                    }
                },
                {
                    class: 'color-state-warning',
                    text: "Edit",
                    callback: () => {
                        let url = new URL(location.origin);
                        url.pathname = '/doc.html';
                        url.search = location.search + '&lot=A2012323';
                        location = url;
                    }
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

class InputForm{

    constructor({
        parent,
        configs = []
    }){
        this.parent = parent;
        this.configs = configs;
        this.elem = new Object();
        this.inputs = new Object();

        this._createHTML();
    }

    element(){
        return this.elem.holder
    }

    _createHTML(){
        this.elem.holder = document.createElement('form');

        this.configs.forEach(config => {
            this.inputs[config.id] = new InputElement({
                parent: this.element(),
                ...config,
            });
        });

        if(this.parent)
            this.parent.appendChild(this.element());
    }

    get(){
        let ret = new Object();
        for (const key in this.inputs) {
            ret[key] = this.inputs[key].get()
        }
        return ret;
    }

    reset(){
        for (const key in this.inputs) {
            this.inputs[key].reset()
        }
    }

    set(setValueObj){
        for (const key in setValueObj) {
            if(this.inputs[key]){
                this.inputs[key].set(setValueObj[key])
            }
        }
    }

}

class InputElement{

    constructor({
        parent = document.body,
        label = "Unlabeled",
        type = "text",
        placeholder = "",
        selection = [],
        value = [],
        isEditable = true,
        inputListener,
    }){
        this.inputListener = inputListener;
        this.parent = parent;
        this.strLabel = label;
        this.type = type;
        this.placeholder = placeholder;
        this.elem = new Object();
        this.isEditable = isEditable;
        this.selection = selection;

        this._createHTML();

        if(value.length>0){
            this.set(value);
        }
    }

    _createHTML(){
        
        this.elem.label = document.createElement('label');
        this.elem.label.textContent = this.strLabel;

        switch (this.type) {
            case "text":
            case "date":
            case "time":
                this.elem.input = [
                    document.createElement('input')
                ];
                this.elem.input[0].setAttribute("type",this.type);
                this.elem.input[0].placeholder = this.placeholder;
                break;
            
            case "duration":
                this.elem.input = [
                    document.createElement('input')
                ];
                this.elem.input[0].setAttribute("type","text");
                this.elem.input[0].setAttribute("data-hide-seconds", "true");
                this.elem.input[0].classList.add("html-duration-picker");
                break;
            
            case "list":
                this.elem.input = [
                    document.createElement('input')
                ];
                this.elem.input[0].setAttribute("type","text");
                this.elem.input[0].setAttribute("list","autoList");
                // generate datalist
                let dL = document.createElement('datalist');
                dL.setAttribute("id", "autoList");
                // generate value, append to datalist
                this.selection.forEach(val => {
                    let op = document.createElement("option");
                    op.setAttribute("value", val);
                    dL.appendChild(op);
                });
                this.elem.input[0].appendChild(dL);
                break;

            case "datetime":
                this.elem.input = [
                    document.createElement('input'),
                    document.createElement('input')
                ];
                this.elem.input[0].setAttribute("type","date");
                this.elem.input[0].classList.add("input-double");
                this.elem.input[1].setAttribute("type","time");
                this.elem.input[1].classList.add("input-double");

                break;

            default:
                break;
        }

        this.parent.appendChild(this.elem.label);
        this.elem.input.forEach(element => {
            if(!this.isEditable) element.setAttribute("disabled","true");
            if(this.inputListener) element.addEventListener("input", this.inputListener);
            this.parent.appendChild(element)
        });
    }

    get(){
        return this.elem.input.map(i => {
            return i.value
        })
    }

    set(array){
        array.forEach((val, idx) => {
            this.elem.input[idx].value = val
        })
    }

    reset(){
        this.elem.input.forEach((_, idx) => {
            this.elem.input[idx].value = ""
        })
    }

}

class Separator{

    constructor(parent){
        this.elem = document.createElement('div');
        this.elem.classList.add("separator");
        if(parent) parent.appendChild(this.elem);
    }

    element(){
        return this.elem;
    }
}

class HoverCard{

    constructor({
        parent,
        childs = new Array(),
    }){
        this.parent = parent;
        this.childs = childs;
        this._createHTML();
        this.hide();
    }

    element(){
        return this.elem;
    }

    show(){
        this.elem.style.display = "block"
    }

    hide(){
        this.elem.style.display = "none"
    }

    _createHTML(){
        this.elem = document.createElement('section');
        this.elem.classList.add('hovercards-holder');
        this.elem.style.zIndex = 990;
        if(this.parent) this.parent.appendChild(this.elem);

        this.card = document.createElement('div');
        this.card.classList.add('hovercards-card');
        this.elem.appendChild(this.card);

        this.childs.forEach((elem) => {
            this.card.appendChild(elem)
        });
    }

}

class Table{

    constructor({
        parent,
        header = []
    }){
        this.header = header;
        this.body = new Array();
        this.parent = parent;
        this.elem = document.createElement('table');
        this.elem.classList.add('table-default');
        if(this.parent) this.parent.appendChild(this.elem);

        this.headerElem = document.createElement('thead');
        this.elem.appendChild(this.headerElem);

        let trhead = document.createElement('tr');
        this.headerElem.appendChild(trhead);

        let thnum = document.createElement('th');
        thnum.textContent = "No."
        trhead.appendChild(thnum);

        this.header.forEach(head => {
            let th = document.createElement('th');
            th.textContent = head;
            trhead.appendChild(th);
        })

        this.bodyElem = document.createElement('tbody');
        this.elem.appendChild(this.bodyElem);
    }

    add(content = []){
        let tr = document.createElement('tr');
        let tnum = document.createElement('td');
        tr.appendChild(tnum);
        content.forEach(c => {
            let td = document.createElement('td');
            td.textContent = c;
            tr.appendChild(td);
        })
        this.bodyElem.appendChild(tr);
    }

}

let transpose = a => a[0].map((_, c) => a.map(r => r[c]));

class AnnealingTable extends Table{

    constructor({
        parent,
        header = [],
        eventEmitter,
        emitId = "AnnealingTable",
    }){
        super({parent, header});
        this.annealingList = new Array();
        this.eventEmitter = eventEmitter;
        this.emitId = emitId + " ";
    }

    add(annelingInput){
        
        let annealingData = this._parseData(annelingInput);
        if(this._inputDataFilter(annealingData)){
            this.annealingList.push(annealingData);
            this._generateRow();
        }

    }


    edit({
        index,
        data,
    }){
        let annealingData = this._parseData(data);
        if(this._inputDataFilter(annealingData)){
            this.annealingList[index] = annealingData;
            this._generateRow();
        }
    }


    _generateRow(){

        // remove old tbody
        this.bodyElem.innerHTML = ''

        // draw body
        this.annealingList.forEach((data, idx) => {

            let rowData = this._data2row(data);
            let tr = document.createElement('tr');
            let tnum = document.createElement('td');
            tr.appendChild(tnum);
            
            rowData.forEach(r => {
                let td = document.createElement('td');
                td.textContent = r;
                tr.appendChild(td);
            });

            let tconf = document.createElement('td');
            tr.appendChild(tconf);
            this.bodyElem.appendChild(tr);

            this._sideButton({
                parent: tconf,
                type: "edit",
                callback: () => {
                    this.eventEmitter.emit(this.emitId + "edit", {
                        data: this.annealingList[idx],
                        index: idx,
                    });
                }
            });

            this._sideButton({
                parent: tconf,
                type: "delete",
                callback: () => {
                    this.annealingList.splice(idx, 1);
                    this._generateRow();
                }
            });
        });
    }

    _sideButton({parent, type, callback}){
        
        let button = document.createElement('div');
        parent.appendChild(button);
        parent.style.display = "flex";
        parent.style.flexDirection = "row";
        parent.style.gap = "1em";
        parent.style.justifyContent = "center";

        switch(type){
            case "delete":
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 512 512" width="1em" height="1em"><path fill="#E04F5F" d="M504.1,256C504.1,119,393,7.9,256,7.9C119,7.9,7.9,119,7.9,256C7.9,393,119,504.1,256,504.1C393,504.1,504.1,393,504.1,256z"/><path fill="#FFF" d="M285,256l72.5-84.2c7.9-9.2,6.9-23-2.3-31c-9.2-7.9-23-6.9-30.9,2.3L256,222.4l-68.2-79.2c-7.9-9.2-21.8-10.2-31-2.3c-9.2,7.9-10.2,21.8-2.3,31L227,256l-72.5,84.2c-7.9,9.2-6.9,23,2.3,31c4.1,3.6,9.2,5.3,14.3,5.3c6.2,0,12.3-2.6,16.6-7.6l68.2-79.2l68.2,79.2c4.3,5,10.5,7.6,16.6,7.6c5.1,0,10.2-1.7,14.3-5.3c9.2-7.9,10.2-21.8,2.3-31L285,256z"/></svg>
                `;
                break;
            case "edit":
                button.innerHTML = `
                    <?xml version="1.0"?><svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="1em" height="1em">    <path d="M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z"/></svg>
                `;
                break;
        }

        button.style.cursor = "pointer";
        button.setAttribute("title", type);
        button.addEventListener('click', callback);
        
    }

    _parseData(input){
        let res = new Object();
        res.position = input.position[0];
        res.rollNum = input.rollNum[0];
        res.dimPanjang = parseFloat(input.dimPanjang[0]);
        res.dimLebar = parseFloat(input.dimLebar[0]);
        res.dimTebal = parseFloat(input.dimTebal[0]);
        res.berat = parseFloat(input.berat[0]);
        res.dimension = `${res.dimTebal} x ${res.dimLebar} x ${res.dimPanjang}`
        res.alloyType = input.alloyType[0];
        res.remark = input.remark[0];
        return res;
    }

    _inputDataFilter(data){
        let validData = true;
        if(data.position == '') validData = false;
        if(data.rollNum == '') validData = false;
        if(isNaN(data.dimPanjang)) validData = false;
        if(isNaN(data.dimLebar)) validData = false;
        if(isNaN(data.dimTebal)) validData = false;
        if(isNaN(data.berat)) validData = false;
        if(data.alloyType == '') validData = false;
        return validData;
    }

    _data2row(data){
        return [
            'position', 
            'rollNum', 
            'dimension', 
            'berat', 
            'alloyType', 
            'remark'
        ].map((key, idx) => {
            return data[key]
        })
    }

}

class ErrorViewer{

    constructor({
        parent = document.body,
        message = "No Error",
    }={}){
        this.parent = parent;
        this.message = message;
        this._generateHTML();
    };

    _generateHTML(){
        this.holder = document.createElement("section");
        this.holder.style.zIndex = "999";
        this.holder.classList.add('error-viewer');
        this.parent.appendChild(this.holder);
        this.elemMessage = document.createElement("h3");
        this.holder.appendChild(this.elemMessage);
        this.elemClose = document.createElement("div");
        this.holder.appendChild(this.elemClose);
        this.elemClose.classList = "plus alt clickable";
        this.elemClose.style.width = "1em";
        this.elemClose.style.height = "1em";
        this.hide();
    }

    set(msg, timeout=1){
        this.elemMessage.textContent = msg;
        this.show();
        setTimeout(() => this.hide(), timeout*1000)
    }

    show(){
        this.holder.style.display = "flex";
    }

    hide(){
        this.holder.style.display = "none";
    }

}