import React, {useContext} from "react";
import styled from "styled-components"
import {AutomatonCard} from "./AutomatonCard";
import {BoardStateContext} from "../../Contexts";


export const AutomatonCardsArea = () => {
    const boardStateContext = useContext(BoardStateContext);

    return (
        <AutomatonCards>
            {boardStateContext.executedAutomatonActions.map((actionObject, i) =>
                <AutomatonCard actionObject={actionObject} key={i}/>
            )}
        </AutomatonCards>
    )
}

const AutomatonCards = styled.div`
    display: flex;
    flex-flow: row;
`;