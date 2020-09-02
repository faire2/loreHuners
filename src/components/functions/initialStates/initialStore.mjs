/* INITIAL STORE */
import {GLOBAL_VARS} from "../../../data/idLists.mjs";
import {ASSISTANT_LEVEL, ASSISTANT_STATE, CARD_STATE, CARD_TYPE} from "../enums.mjs";
import {drawInitialCards, shuffleArray} from "../cardManipulationFuntions.mjs";
import {relicEffects} from "../../../data/relicEffects.mjs";
import {Assistants} from "../../../data/assistants.mjs";
import cloneDeep from 'lodash/cloneDeep.js';
import {Guardians} from "../../../data/guardians.mjs";
import {silverAssistantsOfferNumber} from "../constants.mjs";
import {ARTIFACTS, ITEMS} from "../../../data/cards.mjs";

export function getInitialStore(numOfPlayers, assistantsInLegend) {
    /* all items, each item is represented only once! */
    let items = shuffleArray(Object.keys(ITEMS).map(key => {
        return ITEMS[key];
    }));
    items = items.filter(card => card.type !== CARD_TYPE.basic);
    for (let item of items) {
        item.type = CARD_TYPE.item
    }

    /* artifacts */
    let artifacts = shuffleArray(Object.keys(ARTIFACTS).map(key => {
        ARTIFACTS[key].state = CARD_STATE.inStore;
        return ARTIFACTS[key];
    }));
    for (let artifact of artifacts) {
        artifact.type = CARD_TYPE.artifact;
    }

    /* guardians */
    let guardians = [];
    for (let key in Guardians) {
        guardians.push(Guardians[key]);
    }

    /* assistants */
    let assistants = [];
    for (let key in Assistants) {
        Assistants[key].state = ASSISTANT_STATE.inStore;
        Assistants[key].level = ASSISTANT_LEVEL.silver;
        assistants.push(cloneDeep(Assistants[key]))
    }

    /* relics */
    const bronzeRelicEffects = shuffleArray(relicEffects.bronze);
    const silverRelicEffects = shuffleArray(relicEffects.silver);
    const goldRelicEffects = shuffleArray(relicEffects.gold);

    let itemsSetup = drawInitialCards(items, GLOBAL_VARS.itemsInStore);
    let artifactsSetup = drawInitialCards(artifacts, GLOBAL_VARS.artifactsInStore);
    let assistantsSetup = drawInitialCards(assistants, silverAssistantsOfferNumber);
    let assistantsInLegendSetup;
    if (assistantsInLegend) {
        assistantsInLegendSetup = drawInitialCards(assistants, numOfPlayers + 1);
    }

    /*let card = ARTIFACTS.passageShell;
    card.state = CARD_STATE.inStore;
    card.type = CARD_TYPE.artifact;
    artifactsSetup.drawCards.splice(0, 1, card);*/

    for (let card of itemsSetup.drawCards) {
        card.state = CARD_STATE.inStore;
    }
    return {
        artifactsDeck: artifactsSetup.deck,
        artifactsOffer: artifactsSetup.drawCards,
        assistantsDeck: assistantsSetup.deck,
        assistantsOffer: assistantsSetup.drawCards,
        assistantsInLegendOffer: assistantsInLegend ? assistantsInLegendSetup.drawCards : [],
        assistantsInLegendDeck: assistantsInLegend ? assistantsInLegendSetup.deck : [],
        itemsDeck: itemsSetup.deck,
        itemsOffer: itemsSetup.drawCards,
        guardians: shuffleArray(guardians),
        bronzeRelicEffects: bronzeRelicEffects,
        silverRelicEffects: silverRelicEffects,
        goldRelicEffects: goldRelicEffects,
        destroyedCards: [],
    }
}