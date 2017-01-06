import {Component, EventEmitter, Output, OnDestroy} from '@angular/core';
import {environment} from "../../environments/environment";

@Component({
    selector: 'hash-binder',
    template: ''
})
export class HashBinderComponent implements OnDestroy {
    @Output()
    hashChange: EventEmitter<string>;

    private lastRecordedValue: string;
    private readonly listener: EventListener;

    constructor() {
        this.hashChange = new EventEmitter();

        if (environment.location_hash_support) {
            this.listener = () => {
                const hash = window.location.hash;
                if ((hash || '#') !== this.lastRecordedValue) {
                    this.hashChange.emit(window.location.hash.slice(1));
                }
            };

            window.addEventListener("hashchange", this.listener);
        }
    }

    setValue(value: string) {
        if (environment.location_hash_support) {
            window.location.hash = this.lastRecordedValue = '#' + (value || "");
        }
    }

    ngOnDestroy(): void {
        if (environment.location_hash_support) {
            window.removeEventListener("hashchange", this.listener);
        }
    }

}
