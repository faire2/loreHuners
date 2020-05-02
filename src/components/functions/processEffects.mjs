import {addCardToStore, removeCard, drawCards} from "./cardManipulationFuntions.mjs";
import {EFFECT} from "../../data/effects.mjs";
import cloneDeep from 'lodash/cloneDeep.js';
import {payForTravelIfPossible} from "../locations/locationFunctions.mjs";
import {CARD_STATE, CARD_TYPE, ITEM_IDs} from "../../data/idLists.mjs";
import {GUARDIAN_IDs, INCOME_STATE} from "../../data/idLists";

export function processEffects(tCard, cardIndex, originalPlayersState, effects, toBeRemoved, originalStore, location,
                               originalLocations, originalLegend) {
    console.log("Processing effects");
    console.log(effects);
    let tPlayerState = cloneDeep(originalPlayersState);
    let tStore = cloneDeep(originalStore);
    let tLocations = cloneDeep(originalLocations);
    let tActiveEffects = cloneDeep(tPlayerState.activeEffects);
    let processedAllEffects = true;
    exitLoopFromSwitch();

    // eslint-disable-next-line no-unused-vars
    function exitLoopFromSwitch() {
        for (let effect of effects) {
            console.log("Resolving effect: " + effect);
            switch (effect) {
                case EFFECT.activateOccupiedLocation:
                case EFFECT.buyItemWithDiscount3:
                case EFFECT.defeatGuardian:
                case EFFECT.destroyCard:
                case EFFECT.drawFromDiscard:
                case EFFECT.exploreAnyLocationWithDiscount4:
                case EFFECT.gainArtifact:
                case EFFECT.gainItem:
                case EFFECT.buyWithDiscount1:
                case EFFECT.gainExpeditionCard:
                case EFFECT.gainItemToHand:
                case EFFECT.gainResourceFromAdjacentLocation:
                case EFFECT.payToUseOccupiedLocation:
                case EFFECT.progressWithJewel:
                case EFFECT.progressWithTextsOrWeapon:
                case EFFECT.removeGuardian:
                case EFFECT.uptrade:
                case EFFECT.useItemOnMarket:
                case EFFECT.activateYourLocation:
                case EFFECT.useArtifactOnMarket:
                    tActiveEffects.push(effect);
                    break;

                case EFFECT.useAdjacentEmptyLocation:
                    tActiveEffects.push(EFFECT.markOwnLocation);
                    tActiveEffects.push(effect);
                    break;

                case EFFECT.moveAdvToEmptyLocation:
                    tActiveEffects.push(EFFECT.removeAdventurer);
                    tActiveEffects.push(EFFECT.moveAdvToEmptyLocation);
                    break;

                case EFFECT.moveAdvToEmptyAdjacentLocation:
                    tActiveEffects.push(EFFECT.removeAdventurer);
                    tActiveEffects.push(EFFECT.moveAdvToEmptyAdjacentLocation);
                    break;

                // positive effects hidden behind the discard are stored in activeEffects
                case EFFECT.discard:
                    if (tPlayerState.hand.length > 1) {
                        let tEffects = [];
                        const discardIndex = effects.indexOf(EFFECT.discard);
                        for (let i = discardIndex + 1; i < effects.length; i++) {
                            tEffects.push(effects[i]);
                        }
                        tActiveEffects.push(effect);
                        tActiveEffects.splice(1, 0, [...tEffects]);
                        // if discard leads to defeat of guardian, we need to remember the card
                        tActiveEffects.splice(2, 0, {card: tCard, position: cardIndex});
                        return;
                    } else {
                        processedAllEffects = false;
                        return;
                    }

                case EFFECT.defeatThisGuardian:
                    if (tCard) {
                        if (tCard.type === CARD_TYPE.guardian) {
                            tPlayerState.victoryCards.push(GUARDIAN_IDs[tCard.id]);
                            tPlayerState = removeCard(tCard, tPlayerState);
                            tPlayerState.victoryCards[tPlayerState.victoryCards.length - 1].state = CARD_STATE.victoryCards;
                        }
                        // if card is null, we may have stored the guard in evaluating discard effect of the guardian card
                    } else if (tActiveEffects[2]) {
                        tCard = tActiveEffects[2].card;
                        cardIndex = tActiveEffects[2].position;
                        tPlayerState.victoryCards.push(GUARDIAN_IDs[tCard.id]);
                        tPlayerState = removeCard(tCard, tPlayerState);
                        tPlayerState.victoryCards[tPlayerState.victoryCards.length - 1].state = CARD_STATE.victoryCards;
                        tActiveEffects.splice(0, 3);
                    }
                    break;

                case EFFECT.destroyThisCard:
                    if (tCard !== null) {
                    tPlayerState = removeCard(tCard, tPlayerState);
                    }
                    break;

                case EFFECT.destroyThisCardToDefeatAGuardan:
                    if (tCard.state === CARD_STATE.inHand) {
                        tPlayerState = removeCard(tCard, tPlayerState);
                        tActiveEffects.push(EFFECT.defeatGuardian);
                    }
                    break;

                case EFFECT.draw1:
                    tPlayerState = drawCards(1, tPlayerState);
                    break;

                case EFFECT.draw2:
                    tPlayerState = drawCards(2, tPlayerState);
                    break;

                case EFFECT.drawFromDrawDeckOrDiscard:
                    tActiveEffects.push(effect);
                    /* hand is stored in activeEffects to be retrieved later */
                    tActiveEffects.splice(1, 0, tPlayerState.hand);
                    tPlayerState.hand = [...tPlayerState.drawDeck, ...tPlayerState.discardDeck];
                    break;

                case EFFECT.draw2ForGuardian:
                    let isGuardian = false;
                    for (const card of tPlayerState.hand) {
                        if (card.type === CARD_TYPE.guardian) {
                            isGuardian = true
                        }
                    }
                    if (isGuardian) {
                        drawCards(2, tPlayerState)
                    }
                    break;

                case EFFECT.escapeGuardian:
                    if (tCard.type === CARD_TYPE.guardian) {
                        tPlayerState.discardDeck.push(GUARDIAN_IDs[tCard.id]);
                        tPlayerState.activeCards.splice(cardIndex, 1);
                        tPlayerState.hand.push(ITEM_IDs.fear);
                    }
                    break;

                case EFFECT.gainCoinIfFirst:
                    tPlayerState.resources.coins += 1;
                    break;

                case EFFECT.GainExploreIfFirst:
                    tPlayerState.resources.explore += 1;
                    break;

                case EFFECT.gainDiscoveryBonus:
                    tActiveEffects.push(effect);
                    /* hand is stored in activeEffects to be retrieved later */
                    tActiveEffects.splice(1, 0, tPlayerState.hand);
                    let newHand = [];
                    for (let card of tPlayerState.victoryCards) {
                        if (card.type === CARD_TYPE.guardian) {
                            newHand.push(card);
                        }
                    }
                    tPlayerState.hand = newHand;
                    break;

                case EFFECT.gainAdventurerForThisRound:
                    tPlayerState.availableAdventurers += 1;
                    break;

                case EFFECT.gainCoin:
                    tPlayerState.resources.coins += 1;
                    break;

                case EFFECT.gainCoinsAndJewelForGuardianVP:
                    tActiveEffects.push(effect);
                    /* hand is stored in activeEffects to be retrieved later */
                    tActiveEffects.splice(1, 0, tPlayerState.hand);
                    let tempHand = [];
                    for (let card of tPlayerState.victoryCards) {
                        if (card.state === CARD_STATE.victoryCards) {
                            tempHand.push(card);
                        }
                    }
                    tPlayerState.hand = tempHand;
                    break;

                case EFFECT.gainCoinForLegends:
                    // todo legends
                    break;

                case EFFECT.gainCoinsIfLast:
                    if (tPlayerState.hand.length === 1) {
                        tPlayerState.resources.coins += 2
                    }
                    break;

                case EFFECT.gainExplore:
                    tPlayerState.resources.explore += 1;
                    break;

                case EFFECT.gainExploreForGuardians:
                    let guardians = 0;
                    for (const card of tPlayerState.discardDeck) {
                        guardians = card.type === CARD_TYPE.guardian ? guardians + 1 : guardians;
                    }
                    for (const card of tPlayerState.activeCards) {
                        guardians = card.type === CARD_TYPE.guardian ? guardians + 1 : guardians;
                    }
                    guardians = guardians > 4 ? 4 : guardians;
                    tPlayerState.resources.explore += guardians;
                    break;

                case EFFECT.gainExploreForRelics:
                    tPlayerState.resources.explore += tPlayerState.resources.shinies < 5 ? tPlayerState.resources.shinies : 4;
                    for (let relic of tPlayerState.relics) {
                        if (!relic) {tPlayerState.resources.explore += 1};
                    }
                    break;

                case EFFECT.gainFear:
                    tPlayerState.discardDeck.push({...ITEM_IDs.fear});
                    break;

                case EFFECT.gainJeep:
                    tPlayerState.resources.jeep += 1;
                    break;

                case EFFECT.gainJewel:
                    tPlayerState.resources.jewels += 1;
                    break;

                case EFFECT.gainPlaceholder:
                    tPlayerState.placeholder = 1;
                    break;

                case EFFECT.gainPlane:
                    tPlayerState.resources.plane += 1;
                    break;

                case EFFECT.gainShiny:
                    tPlayerState.resources.shinies += 1;
                    break;

                case EFFECT.gainShip:
                    tPlayerState.resources.ship += 1;
                    break;

                case EFFECT.gainText:
                    tPlayerState.resources.texts += 1;
                    break;

                case EFFECT.gainWalk:
                    tPlayerState.resources.walk += 1;
                    break;

                case EFFECT.gainWeapon:
                    tPlayerState.resources.weapons += 1;
                    break;

                case EFFECT.loseAdventurer:
                    if (tPlayerState.availableAdventurers > 0) {
                        tPlayerState.availableAdventurers -= 1;
                    } else {
                        processedAllEffects = false;
                    }
                    break;

                case EFFECT.loseCoin:
                    if (tPlayerState.resources.coins > 0) {
                        tPlayerState.resources.coins -= 1;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.loseExplore:
                    if (tPlayerState.resources.explore > 0) {
                        tPlayerState.resources.explore -= 1;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.loseText:
                    if (tPlayerState.resources.texts > 0) {
                        tPlayerState.resources.texts -= 1;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.loseWeapon:
                    if (tPlayerState.resources.weapons > 0) {
                        tPlayerState.resources.weapons -= 1;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.loseJewel:
                    if (tPlayerState.resources.jewels > 0) {
                        tPlayerState.resources.jewels -= 1;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.loseWalk:
                case EFFECT.loseJeep:
                case EFFECT.loseShip:
                case EFFECT.losePlane:
                    const travelResults = payForTravelIfPossible(tPlayerState, null, effect);
                    if (travelResults.enoughResources) {
                        tPlayerState = travelResults.tPlayerState;
                    } else {
                        processedAllEffects = false;
                        return;
                    }
                    break;

                case EFFECT.progress:
                    //todo legends;
                    break;

                case EFFECT.revealItemBuyWithDiscount2:
                    tActiveEffects.push(effect);
                    tStore = addCardToStore(CARD_TYPE.item, tStore);
                    break;

                case EFFECT.revealArtifactBuyWithDiscount:
                    tActiveEffects.push(effect);
                    tStore = addCardToStore(CARD_TYPE.artifact, tStore);
                    break;

                case EFFECT.unlockCard:
                    let cardToUnlock = tPlayerState.activeCards[cardIndex];
                    cardToUnlock.state = CARD_STATE.inHand;
                    tPlayerState.hand.push(cardToUnlock);
                    tPlayerState.activeCards.splice(cardIndex, 1);
                    break;

                default:
                    console.log("HandleCardEffect didn't recognize effect: " + effect);
                    console.log(effects);
            }
        }
    }

    if (!processedAllEffects) {
        console.log("Some effects could not be processed in processEffects");
        return {
            tPlayerState: originalPlayersState,
            tStore: originalStore,
            tLocations: originalLocations,
            processedAllEffects: processedAllEffects
        }
    }
    tPlayerState.activeEffects = tActiveEffects;
    return {
        tPlayerState: tPlayerState,
        tStore: tStore,
        tLocations: tLocations,
        processedAllEffects: processedAllEffects
    };
}

export function gainLockedResourceBack(lockEffects, effects) {
    for (let effect of lockEffects) {
        switch (effect) {
            case EFFECT.lockAdventurer:
                effects.push(EFFECT.gainAdventurerForThisRound);
                break;
            case EFFECT.lockCard:
                effects.push(EFFECT.unlockCard);
                break;
            case EFFECT.lockCoin:
                effects.push(EFFECT.gainCoin);
                break;
            case EFFECT.lockExplore:
                effects.push(EFFECT.gainExplore);
                break;
            case EFFECT.lockText:
                effects.push(EFFECT.gainText);
                break;
            case EFFECT.lockWeapon:
                effects.push(EFFECT.gainWeapon);
                break;
            case EFFECT.lockJewel:
                effects.push(EFFECT.gainJewel);
                break;
            default:
                console.log("Unable to process lockEffect in gainLockedResourceBack: " + lockEffects);
        }
    }
    return effects;
}

export function processIncomeTile(effects, incomeId, playerState) {
    for (let effect of effects) {
        switch (effect) {
            // this effects are handled automatically in end of round
            case EFFECT.gainAdventurerForThisRound:
            case EFFECT.gainCoin:
            case EFFECT.gainExplore:
            case EFFECT.gainText:
            case EFFECT.gainWeapon:
                break;
            case EFFECT.draw1:
            case EFFECT.buyWithDiscount1:
            case EFFECT.gainPlane:
            case EFFECT.uptrade:
                const effectsResult = processEffects(null, null, playerState, [effect], null,
                    null, null, null, null);
                playerState = effectsResult.tPlayerState;

                break;
            default:
                console.log("Unable to process effect in handleClickOnIncomeTile: ");
                console.log(effects);
        }
    }
    for (let income of playerState.incomes) {
        if (income.id === incomeId) {
            income.state = INCOME_STATE.spent;
            break;
        }
    }
    return playerState
}