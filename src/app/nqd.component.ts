import {Component} from '@angular/core';
import {LetterInstance, parseHebrewText} from './hebrew-letter';
import {environment} from '../environments/environment';

@Component({
    selector: 'nqd-root',
    templateUrl: './nqd.component.html'
})
export class NqdComponent {
    letters: LetterInstance[] = [];
    selectedLetter: LetterInstance;

    constructor() {
        if (environment.location_hash_support) {
            this.fullText = window.location.hash.slice(1);
        }
    }

    get fullText() {
        return this.letters.reduce((x, y) => x + y.representation, '');
    }

    set fullText(fullText: string) {
        this.selectedLetter = null;

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
}
