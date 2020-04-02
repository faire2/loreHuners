import React, {useEffect, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import cloneDeep from 'lodash/cloneDeep';

import CardsArea from "./components/main/CardsArea";
import {BoardStateContext, PlayerStateContext} from "./Contexts";
import Resources from "./components/resources/Resources";
import Store from "./components/store/Store";
import {Controls} from "./components/main/Controls";
import {emptyPlayerState} from "./components/functions/initialStateFunctions";
import {processEffects} from "./components/functions/processEffects";
import LocationsArea from "./components/main/LocationsArea";
import {processActiveEffect} from "./components/functions/processActiveEffects";
import {processCardBuy} from "./components/functions/processCardBuy";
import {EFFECT} from "./data/effects";
import ExplorationDialogueModal from "./components/main/LocationExplorationModal";
import {payForTravelIfPossible} from "./components/locations/payForTravelIfPossible";
import {CARD_STATE, CARD_TYPE, LOCATION_IDs, LOCATION_LEVEL, LOCATION_STATE, TRANSMISSIONS} from "./data/idLists";
import {socket} from "./server/socketConnection";

function App() {
    const [playerState, setPlayerState] = useState(emptyPlayerState);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [round, setRound] = useState(1);
    const [store, setStore] = useState(null);
    const [locations, setLocations] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({location: null, guardian: null});
    const [isActivePlayer, setIsActivePlayer] = useState(false);


    useEffect(() => {
        socket.on(TRANSMISSIONS.getStates, states => {
            console.log("received states from server");
            console.log(states);
            setPlayerState(states.playerState);
            setStore(states.store);
            setLocations(states.locations);
            setRound(states.round);
            setIsActivePlayer(states.isActivePlayer);
        })

        socket.on(TRANSMISSIONS.stateUpdate, states => {
            console.log("received states from server");
            console.log(states);
            setPlayerState(states.playerState);
            setStore(states.store);
            setLocations(states.locations);
            setRound(states.round);
            setIsActivePlayer(states.isActivePlayer);
        })
    }, []);

    /** CARD EFFECTS **/
    function handleClickOnCardEffect(effects, cardIndex, isTravel) {
        let tPlayerState = cloneDeep(playerState);
        let tStore = cloneDeep(store);
        const tcard = tPlayerState.hand[cardIndex];
        console.log("Handling card effects: " + tcard.cardName);
        console.log(effects);

        if (isActivePlayer) {
            if (tcard.type === CARD_TYPE.item || tcard.type === CARD_TYPE.basic ||
                (tcard.type === CARD_TYPE.artifact && tPlayerState.resources.texts > 0)) {
                const effectsResult = processEffects(tcard, cardIndex, tPlayerState, effects, null, tStore, null, null);

                tPlayerState = effectsResult.tPlayerState;
                if (tcard.type !== CARD_TYPE.basic && !isTravel) {
                    tPlayerState.actions -= 1;
                }
                tStore = effectsResult.tStore;

                /* if we have an active card, we move it to discard or to destroyed cards */
                const activeCard = tPlayerState.activeCard;
                if (activeCard !== false) {
                    if (tcard.state !== CARD_STATE.destroyed) {
                        tPlayerState.discardDeck.push(activeCard)
                    } else {
                        tPlayerState.destroyedCards.push(activeCard)
                    }
                }
                /* we make the played card the active one... */
                tPlayerState.activeCard = tcard;
                /* ...and remove it from the hand */
                tPlayerState.hand.splice(cardIndex, 1);

                /* if the card is an artifact, pay for the use */
                if (tcard.type === CARD_TYPE.artifact) {
                    tPlayerState.resources.texts -= 1;
                }

                setPlayerState(tPlayerState);
                setStore(tStore);
            }
        }
    }

    /** LOCATION EFFECTS **/
    function handleClickOnLocation(effects, location) {
        if (isActivePlayer) {
            console.log("Clicked on location");
            let tPlayerState = cloneDeep(playerState);
            const resources = tPlayerState.resources;

            /* Resolve active effects */
            if (tPlayerState.activeEffects.length > 0) {
                const effectResult = processActiveEffect(null, null, {...location}, tPlayerState,
                    null, {...store}, {...locations});
                setPlayerState(effectResult.tPlayerState);
                setLocations(effectResult.tLocations);
                setStore(effectResult.tStore);
            } else {
                switch (location.state) {
                    case LOCATION_STATE.unexplored:
                        if (resources.explore >= location.exploreCost.explore
                            && resources.coins >= location.exploreCost.coins && playerState.actions > 0) {
                            resources.coins -= location.exploreCost.coins;
                            resources.explore -= location.exploreCost.explore;

                            tPlayerState.actions -= 1;
                            setPlayerState(tPlayerState);

                            let tLocations = cloneDeep(locations);
                            const locationLevel = LOCATION_IDs[location.id].level;
                            let locationsOfLevel;
                            switch (locationLevel) {
                                case LOCATION_LEVEL["1"]:
                                    locationsOfLevel = tLocations.level1;
                                    break;
                                case LOCATION_LEVEL["2"]:
                                    locationsOfLevel = tLocations.level2;
                                    break;
                                case LOCATION_LEVEL["3"]:
                                    locationsOfLevel = tLocations.level3
                                    break;
                                default:
                                    console.log("Unable to process location level in handleLocation: " + locationLevel);
                            }

                            for (let key in locationsOfLevel) {
                                if (locationsOfLevel[key].id === location.id) {
                                    locationsOfLevel[key].state = LOCATION_STATE.explored;
                                }
                            }

                            setLocations(tLocations);
                            setModalData({location: location, guardian: store.guardians[0]});
                            setShowModal(true);
                        }
                        break;
                    case LOCATION_STATE.explored:
                        const travelCheckResults = payForTravelIfPossible(tPlayerState, location);
                        if (travelCheckResults.enoughResources && tPlayerState.actions > 0) {
                            tPlayerState = travelCheckResults.tPlayerState;
                            tPlayerState.availableAdventurers -= 1;
                            tPlayerState.actions -= 1;
                            const effectsResult = processEffects(null, null, tPlayerState, effects, null,
                                {...store}, location, {...locations});
                            setPlayerState(effectsResult.tPlayerState);

                            let tLocation = {...locations[location.index]};
                            tLocation.state = LOCATION_STATE.occupied;
                            let tLocations = {...locations};
                            tLocations.splice(location.index, 1, tLocation);
                            setLocations(tLocations);
                        }
                        break;
                    case LOCATION_STATE.occupied:
                        console.log("Location is occupied.");
                        break;
                    default:
                        console.log("Unknown tLocation state in handleClickOnLocation: " + location.state);
                        console.log(location);
                }
            }
        }
    }

    /** HANDLE ACTIVE EFFECTS **/
    function handleActiveEffectClickOnCard(card, cardIndex) {
        if (isActivePlayer) {
            const effectProcessResults = processActiveEffect(card, cardIndex, null, cloneDeep(playerState),
                null, {...store}, {...locations});
            const tPlayerState = effectProcessResults.tPlayerState;
            const tStore = effectProcessResults.tStore;
            const tLocations = effectProcessResults.tLocations;
            setPlayerState(tPlayerState);
            setStore(tStore);
            setLocations(tLocations);
        }
    }

    /** HANDLE CLICK ON RESOURCE **/
    function handleClickOnResource(resource) {
        if (isActivePlayer) {
            console.log("Handling click on resources with resource: " + resource);
            if (playerState.activeEffects[0] === EFFECT.uptrade && playerState.resources[resource] > 0) {
                const tPlayerState = cloneDeep(playerState);
                let resources = tPlayerState.resources;
                const tActiveEffects = tPlayerState.activeEffects;
                /* todo fix should work with RESOURCES..., but doesn't */
                switch (resource) {
                    case "texts":
                        resources.texts -= 1;
                        resources.weapons += 1;
                        break;
                    case "weapons":
                        resources.weapons -= 1;
                        resources.jewels += 1;
                        break;
                    case "jewels":
                        resources.jewels -= 1;
                        resources.shinies += 1;
                        break;
                    case "shinies":
                        console.log("HERE");
                        resources.shinies -= 1;
                        resources.texts += 3;
                        break;
                    default:
                        console.log("Unknown resource in handleClickOnResource: " + resource);
                }
                tActiveEffects.splice(0, 1);
                setPlayerState(tPlayerState);
            }
        }
    }

    /** BUY A CARD **/
    function handleCardBuy(card, cardIndex) {
        if (isActivePlayer) {
            console.log("Buying card: " + card.cardName + " with effect: " + card.effects);
            if (playerState.actions > 0) {
                const buyResult = processCardBuy(card, cardIndex, cloneDeep(playerState), null,
                    cloneDeep(store), {...locations});
                const tPlayerState = buyResult.tPlayerState;
                const tStore = buyResult.tStore;

                setPlayerState(cloneDeep(tPlayerState));
                setStore(tStore);
            }
        }
    }

    function cancelEffect(effect) {
    }

    /** HANDLE NEW LOCATION EXPLORE **/
    function handleLocationExploredReward(effects) {
        const effectsResult = processEffects(null, null, cloneDeep(playerState), effects,
            null, cloneDeep(store), null, cloneDeep(locations));
        /* costs are only coins and explore => we only need to update playerState */
        let tPlayerState = effectsResult.tPlayerState;
        tPlayerState.discardDeck.push(store.guardians[0]);
        store.guardians.splice(0, 1);
        setPlayerState(effectsResult.tPlayerState);
        setLocations(effectsResult.tLocations);
        setStore(effectsResult.tStore);
        setShowModal(false);
    }

    /** SET NEXT PLAYER **/
    function nextPlayer() {
        if (isActivePlayer) {
            let tPlayerState = cloneDeep(playerState);
            tPlayerState.actions = 1;
            tPlayerState.activeEffects = [];
            socket.emit(TRANSMISSIONS.nextPlayer, {playerState: tPlayerState, store: store, locations: locations})
            setPlayerState(tPlayerState);
        }
    }

    /** END OF ROUND **/
    function handleEndRound() {
        if (isActivePlayer) {
            console.log("finishing round");
            socket.emit(TRANSMISSIONS.finishedRound, {playerState: playerState, store: store, locations: locations})
        }
    }

    return (
        <div className="App">
            <BoardStateContext.Provider value={{
                store: store,
                activeEffects: playerState.activeEffects,
                handleCardEffect: handleClickOnCardEffect,
                handleCardBuy: handleCardBuy,
                handleActiveEffectClickOnCard: handleActiveEffectClickOnCard,
                locations: locations,
                handleClickOnLocation: handleClickOnLocation,
                playerIndex: playerIndex,
                showModal: showModal,
                modalData: modalData,
                handleLocationExploredReward: handleLocationExploredReward,
            }}>
                <PlayerStateContext.Provider value={{
                    playerState: playerState,
                    cancelEffect: cancelEffect,
                    handleEndRound: handleEndRound,
                    nextPlayer: nextPlayer,
                }}>
                    <Resources handleClickOnResource={handleClickOnResource}/>
                    <Store/>
                    <LocationsArea/>
                    <CardsArea/>
                    <div className="d-inline-flex flex-row text-center">
                        <Controls/><br/>
                    </div>
                    <div>
                        {playerState.activeEffects[0]}
                        {isActivePlayer ? <p>Your turn! Actions: {playerState.actions}</p> : <p>Wait for your turn...</p>}
                    </div>
                    <ExplorationDialogueModal/>
                </PlayerStateContext.Provider>
            </BoardStateContext.Provider>
        </div>
    )
}

export default App;