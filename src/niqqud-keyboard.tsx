import { Component } from "preact";
import { LetterInstance, Niqqud } from "./hebrew-letter";

export interface NiqqudKeyboardProps {
    letter: LetterInstance;
    onToggle: (niqqud: Niqqud) => void;
}

export class NiqqudKeyboard extends Component<NiqqudKeyboardProps> {
    render() {
        return <div class="niqqud-keyboard">
            {this.props.letter.applicableNiqqudByGroups.map((group, group_idx) => 
                <ul class={'hebrew-text' + (group_idx===0 ? ' has-flourish-above' : '')}>{
                    group.map((niqqud, niqqud_idx) => 
                        <li
                            class={
                                'hebrew-text-letterblock'
                                + (this.props.letter.hasNiqqud(niqqud) ? ' is-selected' : '')
                            }
                            onClick={this.props.onToggle.bind(null, niqqud)}
                        >
                            {this.props.letter.consonant + niqqud.representation}
                        </li>
                    )
                }</ul>
            )}
        </div>;
    }
}
