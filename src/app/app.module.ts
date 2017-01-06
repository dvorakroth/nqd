import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {NiqqudKeyboardComponent} from './niqqud-keyboard/niqqud-keyboard.component';
import { HashBinderComponent } from './hash-binder/hash-binder.component';
import { HashBinderValueAccessorDirective } from './hash-binder/hash-binder-value-accessor.directive';


@NgModule({
    declarations: [
        AppComponent,
        NiqqudKeyboardComponent,
        HashBinderComponent,
        HashBinderValueAccessorDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
