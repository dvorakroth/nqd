const HEBREW_LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשתװױײ'.split('');
const NON_FINAL_HEBREW_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

export class Niqqud {
    readonly representation: string; // the actual unicode representation of the niqqud
    readonly group: number; // niqqud come in "groups" and there can only be one of each group on a letter
    readonly applicableLetters: string[]; // this niqqud may only be applied to these letters (or any, if null or empty)

    constructor(representation: string, group: number, applicableLetters: string[] = null) {
        this.representation = representation;
        this.group = group;
        this.applicableLetters = applicableLetters || NON_FINAL_HEBREW_LETTERS.slice(0);
    }

    isApplicableToLetter(letter: string) {
        if (!letter || !this.applicableLetters || this.applicableLetters.length === 0) {
            return true;
        } else {
            return this.applicableLetters.indexOf(letter) >= 0;
        }
    }
}

export const ALL_NIQQUD = [
    new Niqqud('\u05B0', 0, NON_FINAL_HEBREW_LETTERS.concat(['ך'])), // sheva

    // a
    new Niqqud('\u05B2', 0), // hataf patah
    new Niqqud('\u05B7', 0, NON_FINAL_HEBREW_LETTERS.concat(['ײ'])), // patah
    new Niqqud('\u05B8', 0, NON_FINAL_HEBREW_LETTERS.concat(['ך'])), // qamats

    // e
    new Niqqud('\u05B1', 0), // hataf segol
    new Niqqud('\u05B6', 0), // segol
    new Niqqud('\u05B5', 0), // tsere

    // i
    new Niqqud('\u05B4', 0), // hiriq

    // o
    new Niqqud('\u05B3', 0), // hataf qamats
    new Niqqud('\u05B9', 0), // holam (or holam male on vav)
    // note: there seems to be no way to write vav with holam haser without it breaking on at least some systems
    // so i chose to follow the iphone hebrew keyboard's lead and use the holam haser for vav unicode character
    // luckily, most culmus fonts seems to work with it
    new Niqqud('\u05BA', 0, ['ו']), // holam haser for vav

    // new Niqqud("\u05C2", true, ["ו"]), // holam haser for vav (sin dot)
    // new Niqqud("\u200C\u05BA", true, ["ו"]), // holam haser for vav (w/zero-width non-joiner)

    // u
    new Niqqud('\u05BB', 0), // qubuts

    // shin/sin
    new Niqqud('\u05C1', 1, ['ש']), // shin (right) dot
    new Niqqud('\u05C2', 1, ['ש']), // sin (left) dot

    // dagesh/rafe
    new Niqqud('\u05BC', 2, NON_FINAL_HEBREW_LETTERS.concat(['ך', 'ף'])), // dagesh or mapiq
    new Niqqud('\u05BF', 2, 'בכפ'.split('')) // rafe
];

export const NIQQUD_GROUPS = ALL_NIQQUD.reduce(
    (g, niqqud) => (g.indexOf(niqqud.group) < 0) ? g.concat([niqqud.group]) : g,
    []
).sort();

export const NIQQUD_BY_GROUPS = NIQQUD_GROUPS.map((group) => ALL_NIQQUD.filter((n) => n.group === group));

const PRE_BAKED_NIQQUD = (function() {
    const dageshPreBaked = 'אּבּגּדּהּוּזּטּיּךּכּלּמּנּסּףּפּצּקּרּשּתּ'.split('');
    const dageshDifference = 0xFB30 - 0x05D0; // difference between aleft with mapiq and regular alef

    return dageshPreBaked.map((c) => [c, String.fromCharCode(c.charCodeAt(0) - dageshDifference) + '\u05BC']);
})().concat([
    ['יִ', 'י' + '\u05B4'], // yod with hiriq
    ['שׁ', 'ש' + '\u05C1'], // shin with shin dot
    ['שׂ', 'ש' + '\u05C2'], // shin with sin dot
    ['שּׁ', 'ש' + '\u05C1\u05BC'], // shin with dagesh and shin dot
    ['שּׂ', 'ש' + '\u05C2\u05BC'], // shin with dagesh and sin dot
    ['אַ', 'א' + '\u05B7'], // alef with patah
    ['אָ', 'א' + '\u05B8'], // alef with qamats
    ['וֹ', 'ו' + '\u05B9'], // vav with holam (male)
    ['בֿ', 'ב' + '\u05BF'], // bet with rafe
    ['כֿ', 'כ' + '\u05BF'], // kaf with rafe
    ['פֿ', 'פ' + '\u05BF'], // pe with rafe
    ['ײַ', 'ײ' + '\u05B7'] // yod yod with patah
]);

export class LetterInstance {
    private _consonant: string;
    private _niqqudByGroups: Map<number, Niqqud> = new Map<number, Niqqud>();
    private _applicableNiqqudByGroups: Niqqud[][] = [];

    constructor(consonant: string, allNiqqud: Niqqud[] = []) {
        this.consonant = consonant;

        for (let niqqud of allNiqqud) {
            this.addNiqqud(niqqud);
        }
    }

    get consonant() {
        return this._consonant;
    }

    set consonant(consonant: string) {
        // remove all niqqud that can't be applied to this consonant
        this._niqqudByGroups.forEach((niqqud, group) => {
            if (!niqqud.isApplicableToLetter(consonant)) {
                this._niqqudByGroups.delete(group);
            }
        });

        this._consonant = consonant;

        this.regenerateAvailableNiqqud();
    }

    get representation() {
        let result = this._consonant;

        for (let group of NIQQUD_GROUPS) {
            if (this._niqqudByGroups.has(group)) {
                result += this._niqqudByGroups.get(group).representation;
            }
        }

        return result;
    }

    get applicableNiqqudByGroups() {
        return this._applicableNiqqudByGroups;
    }

    addNiqqud(niqqud: Niqqud) {
        this.validateNiqqudBeforeAdding(niqqud);

        this._niqqudByGroups.set(niqqud.group, niqqud);
    }

    removeNiqqud(niqqud: Niqqud): boolean {
        if (this.hasNiqqud(niqqud)) {
            this._niqqudByGroups.delete(niqqud.group);
            return true;
        } else {
            return false;
        }
    }

    toggleNiqqud(niqqud: Niqqud) {
        if (!this.removeNiqqud(niqqud)) {
            this.addNiqqud(niqqud);
        }
    }

    hasNiqqud(niqqud: Niqqud): boolean {
        return this._niqqudByGroups.get(niqqud.group) === niqqud;
    }

    private validateNiqqudBeforeAdding(niqqud: Niqqud) {
        if (!niqqud) {
            throw new Error('null niqqud');
        }

        if (!niqqud.isApplicableToLetter(this._consonant)) {
            throw new Error(`Niqqud ${niqqud} not applicable to letter ${this._consonant}`);
        }
    }

    private regenerateAvailableNiqqud() {
        const onlyApplicable = (v) => v.isApplicableToLetter(this.consonant);

        this._applicableNiqqudByGroups = NIQQUD_BY_GROUPS
            .map((x) => x.filter(onlyApplicable))
            .filter((g) => g.length);
    }
}

function parseNiqqud(niqqudString: string, letterString: string): Niqqud {
    // returns undefined when not found; null when found but invalid for this letter

    let thereWereInvalids = false;

    for (let niqqud of ALL_NIQQUD) {
        if (niqqud.representation === niqqudString) {
            if (!letterString || niqqud.isApplicableToLetter(letterString)) {
                return niqqud;
            } else {
                thereWereInvalids = true;
            }
        }
    }

    return thereWereInvalids ? null : (void 0);
}

export function parseHebrewText(text: string): LetterInstance[] {
    // replace all pre-baked letters with their letter + niqqud
    for (let [prebaked, postbaked] of PRE_BAKED_NIQQUD) {
        text = text.replace(prebaked, postbaked);
    }

    let currentLetter: LetterInstance = null;
    let result: LetterInstance[] = [];

    for (let c of text) {
        if (HEBREW_LETTERS.indexOf(c) >= 0) {
            // new letter
            currentLetter = new LetterInstance(c);
            result.push(currentLetter);

            continue;
        }

        // check if the character is a niqqud
        const foundNiqqud = parseNiqqud(c, currentLetter ? currentLetter.consonant : null);

        if (typeof(foundNiqqud) === 'undefined') {
            // no niqqud was found -- this is probably a non-Hebrew character
            currentLetter = new LetterInstance(c);
            result.push(currentLetter);
        } else if (foundNiqqud === null) {
            // niqqud was found, but doesn't fit

            // add it as a standalone square
            currentLetter = null;
            result.push(new LetterInstance('', [parseNiqqud(c, null)]));
        } else {
            // found applicable niqqud!

            if (currentLetter) {
                currentLetter.addNiqqud(foundNiqqud);
            } else {
                result.push(new LetterInstance('', [foundNiqqud]));
            }
        }
    }

    return result;
}
