import {Component, AfterViewInit} from '@angular/core';
import {LetterInstance, parseHebrewText} from './hebrew-letter';
import {environment} from '../environments/environment';

@Component({
    selector: 'nqd-root',
    templateUrl: './nqd.component.html'
})
export class NqdComponent implements AfterViewInit {
    letters: LetterInstance[] = [];
    selectedLetter: LetterInstance;

    constructor() {
        if (environment.location_hash_support) {
            this.fullText = decodeURIComponent(window.location.hash.slice(1));
        }
    }

    get fullText() {
        return this.letters.reduce((x, y) => x + y.representation, '');
    }

    set fullText(fullText: string) {
        this.selectedLetter = null;

        // if the user types in multiline text, then selects-all and deletes it, the browser seems to thinks
        // that the text in the input box is a single newline and nothing else (and if the user only typed a
        // newline, it seems the text gets set to '\n\n' but that's not as bad)

        // there's a related workaround in the contenteditable-model.directive.ts
        if (fullText == '\n') {
            fullText = '';
        }

        this.letters = !fullText ? [] : parseHebrewText(fullText);
    }

    letterClicked(letter: LetterInstance) {
        if (!letter.applicableNiqqudByGroups || !letter.applicableNiqqudByGroups.length) {
            return;
        }

        if (this.selectedLetter === letter) {
            this.selectedLetter = null;
        } else {
            this.selectedLetter = letter;
        }
    }

    ngAfterViewInit(): void {
        let lastTouch: number;

        // prevent double-tap zoom (in iOS 10 the meta tag doesn't suffice)
        document.body.addEventListener('touchstart', function preventZoom(event) {
            const t2 = event.timeStamp;
            const t1 = lastTouch || t2;
            const dt = t2 - t1;
            const fingers = event.touches.length;
            lastTouch = t2;
            if (!dt || dt > 500 || fingers > 1) {
                return; // not double-tap
            }
            event.preventDefault(); // double tap - prevent the zoom

            // also synthesize click events we just swallowed up
            const e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            e['synthetic'] = true;

            event.target.dispatchEvent(e);
        });
    }
}
