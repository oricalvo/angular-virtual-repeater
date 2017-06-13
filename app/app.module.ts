import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {VirtualScrollModule} from "angular2-virtual-scroll";
import {
    VirtualForDirective, VirtualHostDirective, VirtualScrollComponent,
    VirtualService
} from "./virtualFor.directive";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
    ],
    providers: [
        VirtualService,
    ],
    bootstrap: [
        AppComponent,
    ],
    declarations: [
        AppComponent,
        VirtualForDirective,
        VirtualHostDirective,
        VirtualScrollComponent,
    ],
})
export class AppModule {
}
