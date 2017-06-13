import {Component, ElementRef} from "@angular/core";

@Component({
    selector: "my-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
    moduleId: module.id,
})
export class AppComponent {
    contacts: Contact[];

    constructor() {
        this.contacts = [];

        for(var i=1; i<=1000; i++) {
            this.contacts.push({id: i, name: "contact" + i});
        }
    }
}

export interface Contact {
    id: number;
    name: string;
}


