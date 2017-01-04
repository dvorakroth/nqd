import {Component, EventEmitter, Output, OnDestroy} from '@angular/core';

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

        this.listener = () => {
            const hash = window.location.hash;
            if ((hash || '#') !== this.lastRecordedValue) {
                this.hashChange.emit(window.location.hash.slice(1));
            }
        };

        window.addEventListener("hashchange", this.listener);
    }

    setValue(value: string) {
        window.location.hash = this.lastRecordedValue = '#' + (value || "");
    }

    ngOnDestroy(): void {
        window.removeEventListener("hashchange", this.listener);
    }

}
