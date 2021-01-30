AddDocument = {

    holder: document.createElement('section'),
    eventListener: new EventEmitter(),

    element(){
        return this.holder;
    },

    init(parent){

        let url = new URL(location.href);
        this.query = new URLSearchParams(url.search);
        this.draw(parent);

        this.apiHandle();
        this.linkHandle();
        this.errorHandle();

        if (this.query.get('id')) {
            this.eventListener.emit("API:GET DEVICE BY ID", this.query.get('id'));
        } else if(this.query.get('doc')) {
            this.eventListener.emit("API:GET DOCUMENT BY ID", this.query.get('doc'));
        } else {
            this.eventListener.emit("ERROR",new Error("unspecified document"));
            this.loadingScreen.hide();
        }

        this.eventListener.subscribe("DATA:UPDATE FROM DEVICEID", (data) => {
            this.mac_address =  data.mac_address[0].toString(16).match( /.{1,2}/g ).join('-');

            this.furnaceName = data.name
            this.formDocumentInfo.set({
                furnaceNum: [ this.furnaceName ]
            });
            this.loadingScreen.hide();
            console.log(this.mac_address);
        });

        this.eventListener.subscribe("DATA:UPDATE FROM DOCID", (data) => {
            this.mac_address =  data.mac_address;
            this.docId = data._id;

            this.formDocumentInfo.set({
                LotNum: ['A'+data.lot_num],
                spkNum: [data.spk_num],
                spkDate: [new Date(data.spk_date).toISOString().split('T')[0]],
                furnaceNum: [ data.furnace ],
                opStart: [data.operator.start],
                opFinish: [data.operator.finish],
                flag: [data.special ? "Special":"Standard"],
            });

            this.formOvenCfg.set({
                temperType: [data.temper],
                startTime: data.start_date.replace('Z','').split('T'),
                setTemperature1: [data.temperature[0]],
                durationTime1: [this.t2duration(data.duration[0])],
                setTemperature2: [data.temperature[1]],
                durationTime2: [this.t2duration(data.duration[1])],
                coolingTime: [this.t2duration(data.cooling)],
            });
            this.eventListener.emit("FinishTime calculate");

            let annLoad = data.load.map(l => {
                return new Object({
                    rollNum: [l.roll_num],
                    position: [l.position],
                    alloyType: [l.alloy_type],
                    coreDiameter: [l.core_diameter],
                    remark: [l.remark],
                    dimTebal: [l.dimension.thick],
                    dimLebar: [l.dimension.width],
                    dimPanjang: [l.dimension.length],
                    berat: [l.weight],
                });
            });

            annLoad.forEach(l => {
                this.eventListener.emit("AnnealingForm submit", l);
            });

            this.loadingScreen.hide();
            console.log(this.mac_address);
        });

    },

    t2duration(stamp) {
        let hr = Math.floor(stamp/1000/60/60);
        let stmin = stamp - hr*60*60*1000;
        let min = Math.floor(stmin/1000/60);
        return hr.toString().padStart(2,'0') + ":" + min.toString().padStart(2,'0');
    },

    draw(parent){

        this.loadingScreen = new LoadingScreen(parent);
        this.loadingScreen.set()
        this.loadingScreen.show()

        this.holder.classList.add("add-document-holder");

        let type = this.query.get('doc') ? "Edit": "Add";
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
                    value: [ this.furnaceName ],
                    isEditable: false,
                }, {
                    id: "opStart",
                    label: "Start Operator",
                    type: "text",
                }, {
                    id: "opFinish",
                    label: "Finish Operator",
                    type: "text",
                },  {
                    id: "flag",
                    label: "Type",
                    type: "text",
                    value: ["Special"],
                    isEditable: false,
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
                    id: "setTemperature1",
                    label: "Temperature 1",
                    type: "text",
                    placeholder: "200",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "durationTime1",
                    label: "Duration 1",
                    type: "duration",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "setTemperature2",
                    label: "Temperature 2",
                    type: "text",
                    placeholder: "200",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "durationTime2",
                    label: "Duration 2",
                    type: "duration",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "coolingTime",
                    label: "Cooling Duration",
                    type: "duration",
                    inputListener: () => {
                        this.eventListener.emit("FinishTime calculate");
                    }
                }, {
                    id: "finishTime",
                    label: "Finish Time",
                    type: "datetime",
                    isEditable: false,
                },
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
                    id: "coreDiameter",
                    label: "Core (inch)",
                    type: "list",
                    selection: [3, 6],
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
                    label: "Tebal (μ)",
                    type: "text",
                }, {
                    id: "dimLebar",
                    label: "Lebar (mm)",
                    type: "text",
                }, {
                    id: "dimPanjang",
                    label: "Panjang (m)",
                    type: "text",
                }, {
                    id: "berat",
                    label: "Berat (kg)",
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
                            console.log(formData);
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
                "OD",
                "Alloy Type",
                "Remarks",
            ],
            eventEmitter: this.eventListener,
            annealingParameter: new AnnealingParameter(),
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
                        this.eventListener.emit("LINK:GO DEVICE")
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
            this.eventListener.emit("Type updater");
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
            let itemList = this.annealingTable.annealingList;
            let docInfo = this.formDocumentInfo.get();
            let ovenCfg = this.formOvenCfg.get();
            
            console.log(itemList);
            console.log(docInfo);
            console.log(ovenCfg);

            items = itemList.map((i) => {
                return new Object({
                    position: i.position,
                    roll_num: i.rollNum,
                    alloy_type: i.alloyType,
                    dimension: {
                        width: i.dimLebar,
                        length: i.dimPanjang,
                        thick: i.dimTebal,
                    },
                    weight: i.berat,
                    od: i.OD,
                    core_diameter: i.coreDiameter,
                    remark: (i.remark == "") ? "-" : i.remark,
                })
            })

            let lotMatch = docInfo.LotNum[0].match(/[Aa]([\d]+)/)

            data2send = new Object({
                lot_num: ( lotMatch === null) ? undefined : lotMatch[1],
                spk_num: docInfo.spkNum[0],
                spk_date: new Date(docInfo.spkDate[0]),
                furnace: docInfo.furnaceNum[0],
                operator: {
                    start: docInfo.opStart[0],
                    finish: docInfo.opFinish[0],
                },
                special: (docInfo.flag[0] == "Special"),
                temper: ovenCfg.temperType[0],
                start_date: new Date(ovenCfg.startTime.join('T')),
                temperature: [
                    ovenCfg.setTemperature1[0],
                    ovenCfg.setTemperature2[0]
                ],
                duration: [
                    duration2ms(ovenCfg.durationTime1[0]),
                    duration2ms(ovenCfg.durationTime2[0])
                ],
                cooling: duration2ms(ovenCfg.coolingTime[0]),
                load: items,
                mac_address: this.mac_address,
            })

            if(this.docId) data2send.id = this.docId;

            console.log(data2send);
            if(this.query.get('doc')) this.eventListener.emit("API:EDIT DOC", data2send);
            else this.eventListener.emit("API:CREATE DOC", data2send);
        });


        // type updater
        this.eventListener.subscribe("Type updater", () => {

            let ovenCfg = this.formOvenCfg.get();
            let duration1Raw = ovenCfg.durationTime1[0];
            let duration1 = duration2ms(duration1Raw);
            let duration2Raw = ovenCfg.durationTime2[0];
            let duration2 = duration2ms(duration2Raw);
            let coolingRaw = ovenCfg.coolingTime[0];
            let cooling = duration2ms(coolingRaw)
            let ovenTemp1 = parseFloat(ovenCfg.setTemperature1[0]);
            let ovenTemp2 = parseFloat(ovenCfg.setTemperature2[0]);
            let sumDuration = duration1 + duration2 + cooling;

            let typeParam = this.annealingTable.annealingList.map(l => {
                return l.loadParam.data
            });

            let typeMap = typeParam.map(type => {
                return type.filter(t => {
                    return (
                        ((t.duration1Min * 60 * 60 * 1000 + t.duration2Min * 60 * 60 * 1000 + t.coolMin * 60 * 60 * 1000) <= sumDuration) &&
                        ((t.duration1Max * 60 * 60 * 1000 + t.duration2Max * 60 * 60 * 1000 + t.coolMax * 60 * 60 * 1000) >  sumDuration) &&
                        ((ovenTemp1 == t.temperature1 || ovenTemp1 == t.temperature2) &&
                         (ovenTemp2 == t.temperature1 || ovenTemp2 == t.temperature2))
                    );
                }).length > 0;
            });

            console.log(typeMap);
            if((typeMap.indexOf(false) == -1) && (typeMap.length > 0)){
                this.formDocumentInfo.set({ flag: ["Standard"] });
            } else {
                this.formDocumentInfo.set({ flag: ["Special"] });
            }
            this.annealingTable.isSpecial(typeMap);
        })



        // form finish time updater
        this.eventListener.subscribe("FinishTime calculate", () => {
            // get start time & duration
            let ovenCfg = this.formOvenCfg.get();
            let startTimeRaw = ovenCfg.startTime;
            let startTime = new Date(startTimeRaw.join("T"));
            let duration1Raw = ovenCfg.durationTime1[0];
            let duration1 = duration2ms(duration1Raw);
            let duration2Raw = ovenCfg.durationTime2[0];
            let duration2 = duration2ms(duration2Raw);
            let coolingRaw = ovenCfg.coolingTime[0];
            let cooling = duration2ms(coolingRaw);
            if(startTime != "Invalid Date"){
                let finishTimeMs = +startTime + duration1 + duration2 + cooling;
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

            this.eventListener.emit("Type updater");
        })



        // error viewer
        this.errorViewer = new ErrorViewer();

    },

    apiHandle() {

        this.eventListener.subscribe("API:GET DEVICE BY ID", async (deviceId) => {
            console.log("GETTING DEVICE BY ID " + deviceId);
            let res = await fetch(API_LINK + '/device?id=' + deviceId);
            if(res.ok) {
                this.eventListener.emit("API:PARSE DEVICE", res);
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:GET DOCUMENT BY ID", async(docId) => {
            console.log("GETTING DOCUMENT BY ID " + docId);
            let res = await fetch(API_LINK + '/document?id=' + docId);
            if(res.ok) {
                this.eventListener.emit("API:PARSE DOCUMENT", res);
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:PARSE DOCUMENT", async (data) => {
            res = await data.json();
            console.log(res.payload[0]);
            this.eventListener.emit("DATA:UPDATE FROM DOCID", res.payload[0]);
        });

        this.eventListener.subscribe("API:PARSE DEVICE", async (data) => {
            res = await data.json();
            console.log(res.payload[0]);
            this.eventListener.emit("DATA:UPDATE FROM DEVICEID", res.payload[0]);
        });

        this.eventListener.subscribe("API:CREATE DOC", async (data) => {
            console.log("API HANDLE CREATE", JSON.stringify(data));
            let res = await fetch(API_LINK + '/document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                this.eventListener.emit("LINK:GO DEVICE");
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:EDIT DOC", async (data) => {
            console.log("API HANDLE EDIT", JSON.stringify(data));
            let res = await fetch(API_LINK + '/document', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            });
            if(res.ok) {
                this.eventListener.emit("LINK:GO DEVICE");
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

    },

    linkHandle() {

        this.eventListener.subscribe("LINK:GO DEVICE", () => {
            let url = new URL(location);
            let query = new URLSearchParams(url.search);
            url.pathname = '/device.html';
            url.search = `id=${query.get('id')}`;
            location = url;
        });

        this.eventListener.subscribe("LINK:GO HOME", () => {
            location.href = '/'
        });

    },

    errorHandle() {

        this.eventListener.subscribe("ERROR", (e) => {
            console.error(e);
            this.errorViewer.set(e);
        })

    }

}


function duration2ms(dur) {
    try {
        let d = dur.split(':').map(e => {return parseInt(e)});
        if(d.length==0) return 0
        else if(d.length==1) return d[0]*60*60*1000
        else return d[0]*60*60*1000 + d[1]*60*1000;
    } catch(e) {
        console.error(e);
        return 0
    }
}


document.addEventListener("DOMContentLoaded", () => {
    AddDocument.init(document.body);
});