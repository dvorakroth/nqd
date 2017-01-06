import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LetterInstance, Niqqud, NIQQUD_BY_GROUPS} from '../hebrew-letter';

@Component({
    selector: 'niqqud-keyboard',
    templateUrl: './niqqud-keyboard.component.html'
})
export class NiqqudKeyboardComponent implements OnChanges {
    @Input()
    selectedLetter: LetterInstance;

    allNiqqudByGroups: Niqqud[][];

    letterWithNiqqud(niqqud: Niqqud): LetterInstance {
        return new LetterInstance(this.selectedLetter.consonant, [niqqud]);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedLetter']) {
            this.regenerateAvailableNiqqud();
        }
    }

    private regenerateAvailableNiqqud() {
        const filter = (v) => v.isApplicableToLetter(this.selectedLetter.consonant);

        this.allNiqqudByGroups = NIQQUD_BY_GROUPS.map((x) => x.filter(filter)).filter((g) => g.length);
    }
}
