AddDocument = {

    holder: document.createElement('section'),
    eventListener: new EventEmitter(),

    element(){
        return this.holder;
    },

    init(parent){

        let url = new URL(location.href);
        let query = new URLSearchParams(url.search);

        let type = query.get('lot') ? "Edit": "Add";

        this.holder.classList.add("add-document-holder");

        this.titleholder = document.createElement('div');
        this.titleholder.classList.add("title-holder");
        this.titleholder.innerHTML = `<h1>${type} Document</h1>`
        this.holder.appendChild(this.titleholder);

        this.inputHolder = document.createElement("div");
        this.inputHolder.classList.add("input-holder");
        this.holder.appendChild(this.inputHolder);

        parent.appendChild(this.holder);

        this.formDocumentInfo = new InputForm({
            parent: this.inputHolder,
            configs: [
                {
                    id: "LotNum",
                    label: "Lot Number",
                    type: "text",
                    placeholder: "A2012313",
                }, {
                    id: "spkNum",
                    label: "SPK Number",
                    type: "text",
                    placeholder: "001/XIV/20"
                }, {
                    id: "spkDate",
                    label: "SPK Date",
                    type: "date",
                }, {
                    id: "furnaceNum",
                    label: "Furnace",
                    type: "text",
                    value: ["OV1001"],
                    isEditable: false,
                }, {
                    id: "opStart",
                    label: "Start Operator",
                    type: "text",
                }, {
                    id: "opFinish",
                    label: "Finish Operator",
                    type: "text",
                }
            ]
        });
    
        this.formOvenCfg = new InputForm({
            parent: this.inputHolder,
            configs: [
                {
                    id: "temperType",
                    label: "Temper",
                    type: "text",
                    value: ["H0"],
                    isEditable: false,
                }, {
                    id: "startTime",
                    label: "Start Time",
                    type: "datetime",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "durationTime",
                    label: "Duration",
                    type: "duration",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "finishTime",
                    label: "Finish Time",
                    type: "datetime",
                    isEditable: false,
                }, {
                    id: "setTemperature",
                    label: "Temperature",
                    type: "text",
                    placeholder: "200",
                }
            ]
        });

        new Separator(this.element());

        this.annealingAdd = document.createElement('div');
        this.annealingAdd.innerHTML = `
            <div class="annealing-btn-box">
                <span class="plus radius" style="width:38px; height:38px;"></span>  
                <h2 style="margin-left: 10px">Add Annealing Load</h2>
            </div>
        `;
        this.annealingAdd.classList.add('annealing-add-btn');
        this.annealingAdd.classList.add('clickable');
        this.annealingAdd.classList.add('hover-bloom');
        this.element().appendChild(this.annealingAdd);
        
        this.annealingAdd.addEventListener('click', () => {
            this.hoverForm.show();
            this.annealingBtnGroup.edited = undefined;
        });

        // create annealing form
        this.annealingInfoForm = new InputForm({
            configs: [
                {
                    id: "rollNum",
                    label: "Roll No.",
                    type: "text",
                }, {
                    id: "position",
                    label: "Position",
                    type: "text",
                }, {
                    id: "alloyType",
                    label: "Alloy Type",
                    type: "list",
                    selection: [
                        "A1235",
                        "A8011",
                        "A8079",
                        "A1100",
                    ],
                }, {
                    id: "remark",
                    label: "Remark",
                    type: "text",
                }, 
            ]
        });

        this.annealingDimForm = new InputForm({
            configs: [
                {
                    id: "dimTebal",
                    label: "Tebal",
                    type: "text",
                }, {
                    id: "dimLebar",
                    label: "Lebar",
                    type: "text",
                }, {
                    id: "dimPanjang",
                    label: "Panjang",
                    type: "text",
                }, {
                    id: "berat",
                    label: "Berat",
                    type: "text",
                }, 
            ]
        });

        this.annealingBtnGroup = new ButtonGroup({
            buttonConfigList: [
                {
                    class: 'color-state-normal',
                    text: 'Configure Annealing',
                    callback: () => {
                        let formData = {
                            ...this.annealingInfoForm.get(),
                            ...this.annealingDimForm.get(),
                        }

                        let validData = true;
                        if(formData.position[0] == '') validData = false;
                        if(formData.rollNum[0] == '') validData = false;
                        if(isNaN(parseFloat(formData.dimPanjang[0]))) validData = false;
                        if(isNaN(parseFloat(formData.dimLebar[0]))) validData = false;
                        if(isNaN(parseFloat(formData.dimTebal[0]))) validData = false;
                        if(isNaN(parseFloat(formData.berat[0]))) validData = false;
                        if(formData.alloyType[0] == '') validData = false;

                        if(validData){
                            this.eventListener.emit("AnnealingForm submit", formData);
                            this.annealingInfoForm.reset();
                            this.annealingDimForm.reset();
                            this.hoverForm.hide();
                        } else {
                            this.errorViewer.set("Invalid data submission!", 2);
                        }
                        
                    }
                }, {
                    class: 'color-state-danger',
                    text: 'Cancel',
                    callback: () => {
                        this.annealingInfoForm.reset();
                        this.annealingDimForm.reset();
                        this.hoverForm.hide();
                    }
                }
            ]
        });

        this.hoverForm = new HoverCard({
            parent: document.body,
            childs: [
                this.annealingInfoForm.element(),
                new Separator().element(),
                this.annealingDimForm.element(),
                new Separator().element(),
                this.annealingBtnGroup.element(),
            ]
        });

        this.annealingTable = new AnnealingTable({
            parent: this.element(),
            header: [
                "Position",
                "Roll No.",
                "Dimension (Tebal x Lebar x Panjang)",
                "Weight",
                "Alloy Type",
                "Remarks",
                "Config"
            ],
            eventEmitter: this.eventListener,
            emitId: "AnnealingTbl"
        })

        new Separator(this.element());

        this.documentSubmit = new ButtonGroup({
            parent: this.element(),
            buttonConfigList: [
                {
                    text: "Submit Document",
                    class: "color-state-normal",
                    callback: () => {
                        this.eventListener.emit("DocumentForm submit")
                    },
                }, {
                    text: "Cancel",
                    class: "color-state-danger",
                    callback: () => {
                        let url = new URL(location.origin);
                        url.pathname = '/device.html';
                        url.search = `id=${query.get('id')}`;
                        location = url;
                    }
                }
            ]
        });



        // form data handling
        this.eventListener.subscribe("AnnealingForm submit", (data) => {
            if(this.annealingBtnGroup.edited != undefined){
                this.annealingTable.edit({
                    index: this.annealingBtnGroup.edited,
                    data: data,
                });
            } else {
                this.annealingTable.add(data);
            }
        }); 

        this.eventListener.subscribe("AnnealingTbl edit", (res) => {
            this.hoverForm.show();
            let formCompatible = new Object();
            for (const key in res.data) {
                formCompatible[key] = [res.data[key]]
            };
            this.annealingInfoForm.set(formCompatible);
            this.annealingDimForm.set(formCompatible);
            this.annealingBtnGroup.edited = res.index;
        });

        this.eventListener.subscribe("DocumentForm submit", () => {
            console.log(this.annealingTable.annealingList);
            console.log(this.formDocumentInfo.get());
            console.log(this.formOvenCfg.get());
        });



        // form finish time updater
        this.eventListener.subscribe("FinishTime calculate", () => {
            // get start time & duration
            let ovenCfg = this.formOvenCfg.get();
            let startTimeRaw = ovenCfg.startTime;
            let startTime = new Date(startTimeRaw.join("T"));
            let durationRaw = ovenCfg.durationTime[0].split(":").map(e => {return parseInt(e)});
            let durationMs = durationRaw[0] * 60 * 60 * 1000 +
                             durationRaw[1] * 60 * 1000;
            let duration = new Date(durationMs);
            if(startTime != "Invalid Date"){
                let finishTimeMs = startTime-(-duration);
                let finishTime = new Date(finishTimeMs);
                let finishValDate = (finishTime.getFullYear()) + '-' +
                                    (''+(finishTime.getMonth()+1)).padStart(2,'0') + '-' +
                                    (''+finishTime.getDate()).padStart(2,'0');
                let finishValTime = (''+finishTime.getHours()).padStart(2,'0') + ':' +
                                    (''+finishTime.getMinutes()).padStart(2,'0') + ':00';
                
                // set finish time
                this.formOvenCfg.set({
                    finishTime: [finishValDate, finishValTime],
                });
            }
        })



        // error viewer
        this.errorViewer = new ErrorViewer();

    },

}


document.addEventListener("DOMContentLoaded", () => {

    AddDocument.init(document.body);

});