DocumentList = {

    eventListener: new EventEmitter(),
    docList: new Array(),

    init() {
        this.parent = document.querySelector(".document-list");
        this.listElement = document.createElement("div");
        this.listElement.classList.add("doc-list");
        this.parent.appendChild(this.listElement);
        
        this.guiHandle();
        this.apiHandle();
        this.errorHandle();
        this.eventListener.emit("API:GET DOCUMENT");
    },

    guiHandle() {
        this.eventListener.subscribe("UI:GENERATE DOC LIST", (doc) => {
            let searchLink = new URLSearchParams();
            searchLink.set('doc', doc._id);
            this.docList.push(new DocumentCard({
                parent: this.listElement,
                title: "A" + doc.lot_num,
                id: doc._id,
                date: "at " + (new Date(doc.spk_date)).toDateString(),
                oven: doc.furnace,
                searchLink: searchLink,
                onDelete: (id) => {
                    this.eventListener.emit("API:DELETE DOCUMENT", id);
                }
            }))
        })
    },

    apiHandle() {
        this.eventListener.subscribe("API:GET DOCUMENT", async () => {
            console.log("GET DOCUMENT");
            let res = await fetch(API_LINK + '/document');
            if(res.ok) {
                this.eventListener.emit("API:PARSE GET", res);
            } else {
                let err = await res.json();
                this.eventListener.emit("ERROR", err.error);
            }
        });

        this.eventListener.subscribe("API:DELETE DOCUMENT", async (id) => {
            console.log("DELETE DOCUMENT " + API_LINK + '/document?id=' + id);
            let res = await fetch(API_LINK + '/document?id=' + id, {
                method: 'DELETE',
            });
            if(res.ok) {
                location.reload();
            }
        });

        this.eventListener.subscribe("API:PARSE GET", async (data) => {
            res = await data.json();
            console.log(res);
            
            // for each payload... create new document
            res.payload.forEach(doc => {
                this.eventListener.emit("UI:GENERATE DOC LIST", doc);
            });

        })
    },

    errorHandle() {
        this.eventListener.subscribe("ERROR", (e) => {
            console.error(e);
            this.errorViewer.set(e);
        })
    }

}


DocumentSearch = {

    init() {
        this.parent = document.querySelector(".document-search");
        this._generateHTML();
        this._styling();
    },

    _generateHTML() {
        this.elem = new Object();
        this.elem.holder = document.createElement("div");
        this.parent.appendChild(this.elem.holder);

        this.elem.searchBox = new InputElement({
            parent: this.elem.holder,
            type: "text",
            placeholder: "lot number search ...",
        });

        this.elem.buttons = new ClickableButton({
            parent: this.elem.holder,
            config: {
                class: "color-state-normal",
                text: "search",
                callback: () => {},
            }
        });
    },

    _styling() {
        this.elem.holder.style.display = "grid";
        this.elem.holder.style.gridTemplateColumns = "auto 200px";
        this.elem.holder.style.gap = "var(--medium)";

        this.elem.searchBox.element()[0].style.padding = "var(--medium)";
        this.elem.searchBox.element()[0].style.fontSize = "1em";
        this.elem.searchBox.element()[0].style.borderRadius = "var(--normal)";

        this.elem.buttons.element().style.padding = "var(--medium)";
        this.elem.buttons.element().style.fontSize = "1em";
        this.elem.buttons.element().style.borderRadius = "var(--normal)";
        this.elem.buttons.element().style.textAlign = "center";
    }

}


DocumentDownload = {

    init() {
        this.parent = document.querySelector(".document-download");
        this.elem = new Object();

        this.elem.dateForm = new InputForm({
            parent: this.parent,
            configs: [
                {
                    label: "Download from",
                    type: "date",
                }, {
                    label: "Download to",
                    type: "date",
                }
            ]
        })
        
        this.elem.downloadButton = new ClickableButton({
            parent: this.parent,
            config: {
                class: "color-state-normal",
                text: "download data",
                callback: () => {},
            },
        });

        this._styling()
    },

    _styling() {

        this.parent.style.display = "grid";
        this.parent.style.gap = "var(--large)";

        this.elem.dateForm.element().style.display = "grid";
        this.elem.dateForm.element().style.gridTemplateColumns = "20% auto";
        this.elem.dateForm.element().style.gridTemplateRows = "auto auto";
        this.elem.dateForm.element().style.gap = "var(--normal)";

        this.elem.downloadButton.element().style.height = "max-content";
        this.elem.downloadButton.element().style.margin = "auto";
        this.elem.downloadButton.element().style.textAlign = "center";
        this.elem.downloadButton.element().style.padding = "var(--medium) var(--xlarge)";
        this.elem.downloadButton.element().style.borderRadius = "var(--normal)";

        this.elem.dateForm.element().querySelectorAll("label").forEach((i) => {
            i.style.padding = "var(--medium) 0";
        })

    }

}

BackToMenu = {
    init() {
        this.parent = document.querySelector(".back-to-menu");
        this.elem = new ClickableButton({
            config: {
                class: 'back-to-dashboard',
                text: 'ᐊ Back to Dashboard',
                callback: () => {
                    location.href = '/';
                }
            },
            parent: this.parent,
        });
        this._styling();
    },

    _styling() {
        this.elem.element().style.padding = "var(--xlarge)";
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    DocumentList.init();
    DocumentSearch.init();
    DocumentDownload.init();
    BackToMenu.init();
})