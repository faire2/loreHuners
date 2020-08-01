import {ASSISTANT_STATE} from "../../functions/enums";
import styled from "styled-components";
import React from "react";
import {getJsxSymbol} from "../../functions/getJsxSymbol";

export const AssistantEffects = props => {
    const state = props.state;
    const effects = props.effects;

    return (
        <EffectsWrapper overlay={state === ASSISTANT_STATE.spent}>
            {effects.map((effect, i) => {
                    return (
                        <MarginWrapper key={i} index={i}>
                            {getJsxSymbol(effect)}
                        </MarginWrapper>
                    )
                }
            )}
        </EffectsWrapper>
    )
}

const EffectsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    background: ${props => props.overlay ? "rgba(0,0,0,0.4)" : "none"};
    border-radius: 3vw;
    height: 90%;
    width: 100%;
`;

const MarginWrapper = styled.div`
    width: 100%;
    height: 100%;
    margin-left: ${props => (props.index * 3)}%;
    position: absolute;
    left: 0;
    top: -12%
`;
