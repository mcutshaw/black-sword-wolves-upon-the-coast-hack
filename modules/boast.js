import {BSHConfiguration} from './configuration.js';
import {calculateCharacterData, downgradeDie, getActorById, interpolate, rollEm} from './shared.js';

/**
 * This function makes a boast role for a specified actor, downgrading the actors
 * boast die as appropriate and returning an object detailing the results of the
 * roll. The function accepts a second parameter to indicate whether the roll
 * should be made with "advantage", "disadvantage" or just a "standard" single
 * die roll (the default).
 */
export function rollBoast(actor, rollType="standard") {
    let result    = {die: {ending: null,
                           starting: null},
                     downgraded: false,
                     rolled: false};
    let actorData = actor.system;

    result.die.starting = result.die.ending = actorData.boast;
    if(actorData.boast !== "exhausted") {
        let data      = {system: {boast: actorData.boast}};
        let dice;


        result.die.starting = actorData.boast;
        result.rolled       = true;
        if(rollType === "advantage") {
            dice = new Roll(`2${actorData.boast}kh`);
        } else if(rollType === "disadvantage") {
            dice = new Roll(`2${actorData.boast}kl`);
        } else {
            dice = new Roll(`1${actorData.boast}`);
        }

        return(rollEm(dice).then((roll) => {
                    result.formula = roll.formula;
                    result.result  = roll.total;
                    if(roll.total < 3) {
                        let newDie = downgradeDie(actorData.boast);

                        result.downgraded = true;
                        result.die.ending = newDie;
                        data.system.boast  = newDie;
                        if(result.die.ending === "exhausted") {
                            ui.notifications.warn(interpolate("bsh.messages.boast.failExhausted", {name: actor.name}));
                        }
                    } else {
                        result.die.ending = actor.boast;
                    }
                    actor.update(data, {diff: true});
                    return(result);
                }));
    } else {
        console.error(`Unable to roll boast for ${actor.name} as their boast die is exhausted.`);
        ui.notifications.error(interpolate("bsh.messages.boast.exhausted", {name: actor.name}));
    }
}

/**
 * Sets the actors Boast die to be exhausted and tweaks a few other elements
 * that are tied to Boast.
 */
export async function exhaustBoastDie(actor) {
    if(typeof actor === "string") {
        actor = getActorById(actor);
    }

    if(actor) {
        let updates = {system: {boast: "exhausted",
                                summoning: {demon: "unavailable",
                                            spirit: "unavailable"}}};

        actor.update(updates, {diff: true});
    } else {
        console.error("Unable to find the specified actor to exhaust their Boast die.");
    }
}

/**
 * Resets a characters Boast Die to it's normal maximum level.
 */
export function resetBoastDie(actor) {
    if(typeof actor === "string") {
        actor = getActorById(actor);
    }

    if(actor) {
        let data    = actor.system;
        let updates = {system: {boast: "d6"}};

        calculateCharacterData(actor, CONFIG.configuration);
        if(actor.level > 9) {
            updates.system.boast = "d8";
        }
        actor.update(updates, {diff: true});
    } else {
        console.error("Unable to find the specified actor to reset their Boast die.");
    }
}
