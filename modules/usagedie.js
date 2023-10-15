import {BSHConfiguration} from './configuration.js';
import {calculateCharacterData, downgradeDie, getActorById, interpolate, rollEm} from './shared.js';

/**
 * This function makes a doom role for a specified actor, downgrading the actors
 * doom die as appropriate and returning an object detailing the results of the
 * roll. The function accepts a second parameter to indicate whether the roll
 * should be made with "advantage", "disadvantage" or just a "standard" single
 * die roll (the default).
 */
export function rollUsage(actor, rollType="standard", dieName="doom") {
    let result    = {die: {ending: null,
                           starting: null},
                     downgraded: false,
                     rolled: false};
    let actorData = actor.system;
    var usageDie = actorData["usageDie"][dieName]
    console.log(dieName)
    result.die.starting = result.die.ending = usageDie;
    if(usageDie !== "exhausted") {
        let data      = {system: {usageDie:{[dieName]: usageDie} }};
        let dice;


        // result.die.starting = actorData.doom;
        result.rolled       = true;
        if(rollType === "advantage") {
            dice = new Roll(`2${usageDie}kh`);
        } else if(rollType === "disadvantage") {
            dice = new Roll(`2${usageDie}kl`);
        } else {
            dice = new Roll(`1${usageDie}`);
        }

        return(rollEm(dice).then((roll) => {
                    result.formula = roll.formula;
                    result.result  = roll.total;
                    if(roll.total < 3) {
                        let newDie = downgradeDie(usageDie);

                        result.downgraded = true;
                        result.die.ending = newDie;
                        data.system.usageDie  = {[dieName]: newDie};
                        if(result.die.ending === "exhausted") {
                            ui.notifications.warn(interpolate("bsh.messages.doom.failExhausted", {name: actor.name}));
                        }
                    }
                    // } else {
                    //     result.die.ending = actor.doom;
                    // }
                    console.log(data)
                    actor.update(data, {diff: true});
                    return(result);
                }));
    } else {
        console.error(`Unable to roll doom for ${actor.name} as their doom die is exhausted.`);
        ui.notifications.error(interpolate("bsh.messages.doom.exhausted", {name: actor.name}));
    }
}

/**
 * Sets the actors Doom die to be exhausted and tweaks a few other elements
 * that are tied to Doom.
 */
// export async function exhaustDoomDie(actor) {
//     if(typeof actor === "string") {
//         actor = getActorById(actor);
//     }

//     if(actor) {
//         let updates = {system: {doom: "exhausted",
//                                 summoning: {demon: "unavailable",
//                                             spirit: "unavailable"}}};

//         actor.update(updates, {diff: true});
//     } else {
//         console.error("Unable to find the specified actor to exhaust their Doom die.");
//     }
// }

/**
 * Resets a characters Doom Die to it's normal maximum level.
 */
// export function resetDoomDie(actor) {
//     if(typeof actor === "string") {
//         actor = getActorById(actor);
//     }

//     if(actor) {
//         let data    = actor.system;
//         let updates = {system: {doom: "d6"}};

//         calculateCharacterData(actor, CONFIG.configuration);
//         if(actor.level > 9) {
//             updates.system.doom = "d8";
//         }
//         actor.update(updates, {diff: true});
//     } else {
//         console.error("Unable to find the specified actor to reset their Doom die.");
//     }
// }
