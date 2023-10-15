import {BSHConfiguration} from './configuration.js';
import {calculateCharacterData, downgradeDie, getActorById, interpolate, rollEm} from './shared.js';
import { rollUsage } from './usagedie.js';

/**
 * This function makes a doom role for a specified actor, downgrading the actors
 * doom die as appropriate and returning an object detailing the results of the
 * roll. The function accepts a second parameter to indicate whether the roll
 * should be made with "advantage", "disadvantage" or just a "standard" single
 * die roll (the default).
 */
export function rollDoom(actor, rollType="standard") {
    return rollUsage(actor, rollType)
}

/**
 * Sets the actors Doom die to be exhausted and tweaks a few other elements
 * that are tied to Doom.
 */
export async function exhaustDoomDie(actor) {
    if(typeof actor === "string") {
        actor = getActorById(actor);
    }

    if(actor) {
        let updates = {system: {doom: "exhausted",
                                summoning: {demon: "unavailable",
                                            spirit: "unavailable"}}};

        actor.update(updates, {diff: true});
    } else {
        console.error("Unable to find the specified actor to exhaust their Doom die.");
    }
}

/**
 * Resets a characters Doom Die to it's normal maximum level.
 */
export function resetDoomDie(actor) {
    if(typeof actor === "string") {
        actor = getActorById(actor);
    }

    if(actor) {
        let data    = actor.system;
        let updates = {system: {doom: "d6"}};

        calculateCharacterData(actor, CONFIG.configuration);
        if(actor.level > 9) {
            updates.ystem.usageDie.doom = "d8";
        }
        actor.update(updates, {diff: true});
    } else {
        console.error("Unable to find the specified actor to reset their Doom die.");
    }
}
