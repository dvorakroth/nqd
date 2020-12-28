
import './styles.scss';
import './favicon.png';
import './app-icon-apple.png';
import './app-icon-square.png';

import { LetterInstance, parseHebrewText, Niqqud } from "./hebrew-letter";
import { NiqqudKeyboard } from "./niqqud-keyboard";

import { Component, render } from 'preact';

// prevent double-tap zoom (in iOS 10 the meta tag doesn't suffice)
let lastTouch: number = null;
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

interface ButtonsForLettersProps {
    letters: LetterInstance[];
    selectedIdx: number;
    onClick: (idx: number) => void;
}

const ButtonsForLetters = (
    {letters, selectedIdx, onClick}:ButtonsForLettersProps
) => {
    return <ul class='hebrew-text'> 
        {letters.map((letter, idx) => {
            // these are COMPUTED PROPERTIES :|
            const {applicableNiqqudByGroups, representation} = letter;
            return <li class={
                        'hebrew-text-letterblock'
                        + (selectedIdx === idx ? ' is-selected' : '')
                        + (!applicableNiqqudByGroups || !applicableNiqqudByGroups.length ? ' is-disabled' : '')}
                onClick={onClick.bind(null, idx) /* haha this is bad right?*/}
                >{/*key={"#" + idx + "#" + representation}*/}

                {representation}
            </li>;
        })}
    </ul>;
};

const PLACEHOLDER_TEXT = '(יֵשׁ לְהַקְלִיד כָּאן)';
const HINT_TEXT = 'יֵשׁ לִלְחֹץ עַל הָרִבּוּעִים:';

interface NiqqudizatorState {
    letters: LetterInstance[];
    selectedIdx: number;
    didEverTypeClickableLetter: boolean;
    didEverClick: boolean;
    showClickHint: boolean;
}

class NiqqudizatorComponent extends Component<{}, NiqqudizatorState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            letters: [],
            selectedIdx: null,
            didEverTypeClickableLetter: false,
            didEverClick: false,
            showClickHint: false
        };
    }

    letterClicked = (idx: number) => {
        const letter = this.state.letters[idx];

        if (!letter.applicableNiqqudByGroups || !letter.applicableNiqqudByGroups.length) {
            return;
        }

        if (this.state.selectedIdx === idx) {
            this.setState({
                selectedIdx: null
            });
        } else {
            this.setState({
                selectedIdx: idx
            });
        }

        if (!this.state.didEverClick) {
            this.setState({
                didEverClick: true
            });
        }
    }

    inputKeyup = (event: KeyboardEvent) => {
        let value = this.inputRef.innerText;

        if (value && value.length) {
            console.log('text entered:', {value});
        }

        this.setState({
            letters: value ? parseHebrewText(value) : [],
            selectedIdx: null
        }, () => {
            if (!this.state.didEverTypeClickableLetter) {
                this.maybeStartHintTimer();
            }
        });
    }

    maybeStartHintTimer() {
         // when the user types a clickable letter for the first time, start the click hint timer
         if (!this.state.didEverTypeClickableLetter && this.state.letters.length) {
            // check if any of the characters are actually clickable
            let clickableLetters = false;

            for (const letter of this.state.letters) {
                if (letter.applicableNiqqudByGroups && letter.applicableNiqqudByGroups.length) {
                    clickableLetters = true;
                    break;
                }
            }

            // if nothing is clickable don't show a hint yet
            if (!clickableLetters) {
                console.log('no clickable letters');
                return;
            } else {
                console.log('typed a clickable letter yay');
                this.setState({didEverTypeClickableLetter: true});
            }

            // acutal timer-setting logic
            setTimeout(
                () => {
                    console.log('five seconds passed');
                    if (!this.state.didEverClick) {
                        console.log('never clicked');
                        // if the user *still* never clicked, show the hint
                        this.setState({showClickHint: true});
                    }
                },
                5000 // i think five seconds is enough?
            );
        }
    }

    onNiqqudToggled = (niqqud: Niqqud) => {
        const newLetter = new LetterInstance(this.state.letters[this.state.selectedIdx]);
        newLetter.toggleNiqqud(niqqud);

        const newLetters = this.state.letters.concat([]);
        newLetters[this.state.selectedIdx] = newLetter;

        this.setState({
            letters: newLetters
        }, () => {
            this.inputRef.innerText = newLetters.map((l)=>l.representation).join('');
        });
    }

    private inputRef: HTMLDivElement = null;
    private setInputRef = (r) => this.inputRef = r;

    render() {
        return <div class='nqd-app'>
            <div id='input-container'>
                <div id='initial-input'
                     contentEditable={true}
                     ref={this.setInputRef}
                     onKeyUp={this.inputKeyup}></div>
                <div id='initial-input-placeholder' class={
                    !this.state.letters || !this.state.letters.length
                        ? ''
                        : 'is-hidden'}>
                            {PLACEHOLDER_TEXT}
                </div>

                <div id="click-hint"
                     class={this.state.showClickHint ? 'is-shown' : null}>
                        <span id="click-hint-text">יֵשׁ לִלְחֹץ עַל הָרִבּוּעִים:</span>
                </div>
            </div>
            {
                this.state.letters && this.state.letters.length 
                    ? <ButtonsForLetters
                        letters={this.state.letters}
                        selectedIdx={this.state.selectedIdx}
                        onClick={this.letterClicked} />
                    : null
            }
            {
                this.state.selectedIdx !== null
                    ? <NiqqudKeyboard letter={this.state.letters[this.state.selectedIdx]} onToggle={this.onNiqqudToggled} />
                    : null
            }
        </div>;
    }
}

render(<NiqqudizatorComponent/>, document.body, document.getElementById('app-root'));

