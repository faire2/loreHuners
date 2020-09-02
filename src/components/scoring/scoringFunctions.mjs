import {getLogLegend} from "../main/logger";
import {CARD_TYPE, RELIC} from "../functions/enums";
import {ARTIFACTS, ITEMS} from "../../data/cards.mjs";
import {pointsForUnusedRelics} from "../functions/constants";

export function getPoints(playerState) {
    const legend = getLogLegend();
    const playerIndex = playerState.playerIndex;
    const allDeckCards = [...playerState.hand, ...playerState.drawDeck, ...playerState.activeCards];
    const items = allDeckCards.filter(card => (card.type === CARD_TYPE.item || card.type === CARD_TYPE.basic)
        && card.id !== ITEMS.fear.id);

    /* ITEM POINTS */
    let itemPoints = 0;
    for (let card of items) {
        itemPoints += ITEMS[card.id].points;
    }

    /* ARTIFACTS */
    const artifacts = allDeckCards.filter(card => card.type === CARD_TYPE.artifact);
    let artifactPoints = 0;
    for (let card of artifacts) {
        artifactPoints += ARTIFACTS[card.id].points;
    }

    /* FEARS */
    const fears = allDeckCards.filter(card => card.id === ITEMS.fear.id);
    let fearPoints = 0;
    for (let card of fears) {
        fearPoints += ITEMS[card.id].points;
    }

    /* DEFEATED GUARDIANS */
    const defeatedGuardians = playerState.defeatedGuardians.length;
    let defeatedGuardianPoints = 0;
    defeatedGuardianPoints += defeatedGuardians * 5;

    /* LEGEND */
    let legendPoints;
    const victoryPoints = legend.victoryPoints;
    // points for columns any of tokens reached
    const firstTokenPoints = victoryPoints.firstToken[legend.positions[playerIndex][0].columnIndex];
    const secondTokenPoints = victoryPoints.secondToken[legend.positions[playerIndex][1].columnIndex];
    legendPoints = (firstTokenPoints ? firstTokenPoints : 0) + (secondTokenPoints ? secondTokenPoints : 0);
    // points for position in the lost city
    const lostCityPlayerPositions = legend.lostCityPlayers;
    for (let i = 0; i < lostCityPlayerPositions.length; i++) {
        if (playerState.playerIndex === lostCityPlayerPositions[i]) {
            legendPoints += legend.lostCityPoints[i];
            break;
        }
    }

    /* RELICS */
    let relicsPoints = 0;
    relicsPoints += playerState.resources.bronzeRelics * 3;
    relicsPoints += playerState.resources.silverRelics * 7;
    relicsPoints += playerState.resources.goldRelics * 11;

    // placed relics
    let relics = playerState.relics;
    for (let i = 0; i < relics.length; i++) {
        if (relics[i] === RELIC.bronze) {
            relicsPoints += 3;
        } else if (relics[i] === RELIC.silver) {
            relicsPoints += 7;
        } else if (relics[i] === RELIC.gold) {
            relicsPoints += 11;
        }
    }

    // negative points for used relics
    for (let i = 0; i < pointsForUnusedRelics.length; i++) {
        if (playerState.relics[i] === null) {
            relicsPoints += parseInt(pointsForUnusedRelics[i]);
        }
    }

    const totalPoints = itemPoints + artifactPoints + fearPoints + defeatedGuardianPoints +
        legendPoints + relicsPoints;

    return {
        items: items,
        itemPoints: itemPoints,
        artifacts: artifacts,
        artifactPoints: artifactPoints,
        fears: fears,
        fearPoints: fearPoints,
        defeatedGuardians: defeatedGuardians,
        defeatedGuardianPoints: defeatedGuardianPoints,
        legendPoints: legendPoints,
        relicsPoints: relicsPoints,
        totalPoints: totalPoints
    }
}

export function getAutomatonPoints(automatonState) {
    const legend = getLogLegend();

    /* get card points */
    let items = [];
    let artifacts = [];
    for (let card of automatonState.victoryCards) {
        if (card.type === CARD_TYPE.item) {
            items.push(card);
        } else if (card.type === CARD_TYPE.artifact) {
            artifacts.push(card);
        } else {console.error("Unable to determine card type in getAutomatonPoints:" + card.type)}
    }
    let itemPoints = items.reduce((a, b) => a + b.points, 0);
    let artifactPoints = artifacts.reduce((a, b) => a + b.points, 0);

    /* get relic points */
    let uniqueEffects = [];
    let duplicateEffects = [];
    // automaton gets more points for unique effects, so we have to separate them
    for (let relicEffect of automatonState.relicEffects) {
        if (!uniqueEffects.includes(relicEffect)) {
            uniqueEffects.push(relicEffect);
        } else {
            duplicateEffects.push(relicEffect)
        }
    }

    /* get legend points */
    let legendPoints = 0;
    const victoryPoints = legend.victoryPoints;
    // points for columns any of tokens reached
    legendPoints += parseInt(victoryPoints.firstToken[legend.positions[4][0].columnIndex], 10);
    // points for position in the lost city
    const lostCityPlayerPositions = legend.lostCityPlayers;
    for (let i = 0; i < lostCityPlayerPositions.length; i++) {
        if (4 === lostCityPlayerPositions[i]) {
            legendPoints += legend.lostCityPoints[i];
        }
    }
    if (isNaN(legendPoints)) {
        legendPoints = 0;
    }

    /* silver relics for steps in lost city */
    const silverRelicPoints = 7 * automatonState.silverRelics;

    /* defeated guardians */
    const defeatedGuardianPoints = automatonState.defeatedGuardians * 5;

    let relicPoints = uniqueEffects.length * 3 + duplicateEffects.length * 2;

    return {
        itemPoints: itemPoints,
        artifactPoints: artifactPoints,
        relicPoints: relicPoints,
        legendPoints: legendPoints,
        silverRelicPoints: silverRelicPoints,
        defeatedGuardianPoints: defeatedGuardianPoints
    }
}