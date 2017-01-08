import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LetterInstance, Niqqud, NIQQUD_BY_GROUPS} from '../hebrew-letter';

@Component({
    selector: 'nqd-niqqud-keyboard',
    templateUrl: './nqd.niqqud-keyboard.component.html'
})
export class NqdNiqqudKeyboardComponent implements OnChanges {
    @Input()
    selectedLetter: LetterInstance;

    allNiqqudByGroups: Niqqud[][];

    letterWithNiqqud(niqqud: Niqqud): string {
        return this.selectedLetter.consonant + niqqud.representation;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedLetter']) {
            this.allNiqqudByGroups = this.selectedLetter.applicableNiqqudByGroups;
        }
    }
}
