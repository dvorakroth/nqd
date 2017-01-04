import {Directive, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {HashBinderComponent} from "./hash-binder.component";

const CUSTOM_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HashBinderValueAccessor),
    multi: true
};


@Directive({
    selector: 'hash-binder',
    host: {'(hashChange)': 'onChange($event)'},
    providers: [CUSTOM_VALUE_ACCESSOR]
})
export class HashBinderValueAccessor implements ControlValueAccessor {
    onChange = (_) => {};
    onTouched = () => {};

    constructor(private host: HashBinderComponent) { }

    writeValue(value: any): void {
        this.host.setValue(value);
    }

    registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
