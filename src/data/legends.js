import React from "react";
import {EFFECT} from "./effects";
import {
    Coin, DefeatedGuardian,
    DestroyCard,
    Draw1Card,
    Draw2Cards,
    Explore,
    Jewel,
    Blimp,
    Text, Treasure,
    Uptrade,
    Weapon, AdventurerToken
} from "../components/Symbols";

export const FIELD_SIZE = Object.freeze({
    1: 1,
    2: 2,
    3: 3
});

export const Legends2 = Object.freeze({
    legend1: {
        id: "legend1",
        victoryPoints: [1, 3, 5, 7, 9, 13, 15, 15],
        fields: [
            /* 1 */
            [
                {
                    effects: [],
                    effectsText: [],
                    cost: [EFFECT.loseText, EFFECT.loseWeapon],
                    costText: [<Text/>, <Weapon/>],
                    size: FIELD_SIZE["2"],
                },
                {
                    effects: [],
                    effectsText: [],
                    cost: [EFFECT.loseJewel],
                    costText: [<Jewel/>],
                    size: FIELD_SIZE["1"],
                }
            ],
            /* 2 */
            [
                {
                    effects: [EFFECT.gainExplore],
                    effectsText: [<Explore/>],
                    cost: [EFFECT.loseText, EFFECT.loseJewel],
                    costText: [<Text/>, <Jewel/>],
                    size: FIELD_SIZE["1"],
                },
                {
                    effects: [EFFECT.gainExploreIfFirst, EFFECT.gainCoinIfFirst],
                    effectsText: [<Explore/>, "|", <Coin/>],
                    cost: [EFFECT.loseText, EFFECT.loseText, EFFECT.loseWeapon],
                    costText: [<Text/>, <Text/>, <Weapon/>],
                    size: FIELD_SIZE["2"],
                },
            ],
            /* 3 */
            [
                {
                    effects: [EFFECT.uptrade],
                    effectsText: [<Uptrade/>],
                    cost: [EFFECT.loseText, EFFECT.loseJewel],
                    costText: [<Text/>, <Jewel/>],
                    size: FIELD_SIZE["3"],
                },
            ],
            /* 4 */
            [

                {
                    effects: [EFFECT.gainExploreIfFirst],
                    effectsText: [<Explore/>],
                    cost: [EFFECT.loseText, EFFECT.loseJewel],
                    costText: [<Text/>,<Jewel/>],
                    size: FIELD_SIZE["1"],
                },
                {
                    effects: [EFFECT.gainExploreIfFirst],
                    effectsText: [<Explore/>],
                    cost: [EFFECT.loseCoin, EFFECT.loseText, EFFECT.loseWeapon],
                    costText: [<Coin/>,<Text/>,<Weapon/>],
                    size: FIELD_SIZE["1"],
                },
                {
                    effects: [EFFECT.gainExploreIfFirst],
                    effectsText: [<Explore/>],
                    cost: [EFFECT.loseCoin, EFFECT.loseWeapon],
                    costText: [<Coin/>, <Weapon/>],
                    size: FIELD_SIZE["1"],
                },
            ],
            /* 5 */
            [

                {
                    effects: [EFFECT.draw1],
                    effectsText: [<Draw1Card/>],
                    cost: [EFFECT.loseText, EFFECT.loseWeapon, EFFECT.loseWeapon],
                    costText: [<Text/>, <Weapon/>, <Weapon/>],
                    size: FIELD_SIZE["2"],
                },
                {
                    effects: [EFFECT.destroyCard],
                    effectsText: [<DestroyCard/>],
                    cost: [EFFECT.loseCoin, EFFECT.loseText, EFFECT.loseJewel],
                    costText: [<Coin/>, <Text/>, <Jewel/>],
                    size: FIELD_SIZE["1"],
                },
            ],
            /* 6 */
            [

                {
                    effects: [EFFECT.gainAdventurerForThisRound],
                    effectsText: [<div style={{width: "1.5vw", margin: "0 auto"}}> <AdventurerToken/> </div>],
                    cost: [EFFECT.loseText, EFFECT.loseJewel, EFFECT.loseJewel],
                    costText: [<Text/>, <Jewel/>, <Jewel/>],
                    size: FIELD_SIZE["3"],
                },
            ],
            /* 7 */
            [

                {
                    effects: [EFFECT.gainBlimp, EFFECT.gainBlimp],
                    effectsText: [<Blimp/>, <Blimp/>],
                    cost: [EFFECT.loseText, EFFECT.loseText, EFFECT.loseWeapon, EFFECT.loseJewel],
                    costText: [<Text/>, <Text/>, <Weapon/>, <Jewel/>],
                    size: FIELD_SIZE["1"],
                },
                {
                    effects: [EFFECT.defeatGuardian],
                    effectsText: [<DefeatedGuardian/>],
                    cost: [EFFECT.loseText, EFFECT.loseWeapon, EFFECT.loseWeapon, EFFECT.loseWeapon],
                    costText: [<Text/>, <Weapon/>, <Weapon/>, <Weapon/>],
                    size: FIELD_SIZE["2"],
                },
            ],
            /* 8 */
            [

                {
                    effects: [EFFECT.gainPlaceholder],
                    effectsText: [<Treasure/>],
                    cost: [EFFECT.loseJewel, EFFECT.loseJewel],
                    costText: [<Jewel/>, <Jewel/>],
                    size: FIELD_SIZE["3"],
                }
            ]
        ]
    }
});
