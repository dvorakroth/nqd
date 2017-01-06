import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {NqdComponent} from './nqd.component';
import {NqdNiqqudKeyboardComponent} from './niqqud-keyboard/nqd.niqqud-keyboard.component';
import { NqdHashBinderComponent } from './hash-binder/nqd.hash-binder.component';
import { NqdHashBinderValueAccessorDirective } from './hash-binder/nqd.hash-binder-value-accessor.directive';


@NgModule({
    declarations: [
        NqdComponent,
        NqdNiqqudKeyboardComponent,
        NqdHashBinderComponent,
        NqdHashBinderValueAccessorDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule
    ],
    providers: [],
    bootstrap: [NqdComponent]
})
export class NqdModule {
}
