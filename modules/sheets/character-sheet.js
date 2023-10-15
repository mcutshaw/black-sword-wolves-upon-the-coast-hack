import {randomizeCharacter} from '../characters.js';
import {CLASSIC_ORIGINS} from '../constants.js';
import {initializeCollapsibles} from '../collapsible.js';
import {logDefendRoll,
	    logDoomDieRoll,
		logBoastDieRoll,
	    logInitiativeRoll,
	    logPerceptionRoll,
		logOtherUsageDieRoll} from '../chat_messages.js';
import {resetDarkPact,
        summonDemon,
        summonSpirit} from '../darkpacts.js';
import {getCharacterBackgrounds,
        getCustomOrigins} from '../origins.js';
import {takeLongRest,
        takeShortRest} from '../rests.js';
import {calculateCharacterData,
	    decrementItemQuantity,
	    getActorById,
	    getOwnedItemById,
	    deleteOwnedItem,
	    handleRollAttributeDieEvent,
	    handleRollDieEvent,
	    handleRollUsageDieEvent,
	    handleWeaponRollEvent,
	    incrementItemQuantity,
	    onInfoIconClicked,
	    resetItemUsageDie,
	    showAttributeRollModal,
	    stringToKey} from '../shared.js';
import {castSpell,
        resetSpellState,
        resetSpellStatesForActor} from '../spells.js';



		   


export default class CharacterSheet extends ActorSheet {
	static get defaultOptions() {
	    return(mergeObject(super.defaultOptions,
	    	               {classes: ["bsh", "bsh-sheet", "bsh-character"],
	    	                height: 920,
	    	               	template: "systems/black-sword-hack/templates/sheets/character-sheet.html"}));
	}

    /** @override */
	getData() {
        const context = super.getData();
        let   data    = context.actor.system;

        context.flags         = context.actor.flags;
        context.customOrigins = game.settings.get("black-sword-hack", "customOrigins");
        Object.keys(data.boasts).forEach((key) => data.boasts[key].configuration = CONFIG.configuration);

        if(context.actor.type === "character") {
            this._prepareCharacterData(context);
        }

        return(context);
	}

    /** @override */
    get template() {
        return(`systems/black-sword-hack/templates/sheets/character-sheet.html`);
    }

	activateListeners(html) {
		html.find(".bsh-tab-label").click(this._onTabLabelClicked.bind(this));
		html.find(".bsh-attribute-roll-icon").click(this._onAttributeRollClicked.bind(this));
		html.find(".bsh-dice-roll-icon").click(this._onDieRollClicked.bind(this));
		html.find(".bsh-usage-die-roll-icon").click(this._onUsageDieRollClicked.bind(this));
		html.find(".bsh-attack-roll-icon").click(this._onWeaponRollClicked.bind(this));
		html.find(".bsh-delete-item-icon").click(this._onDeleteItemClicked.bind(this));
		html.find(".bsh-decrease-quantity-icon").click(this._onDecreaseItemQuantityClicked.bind(this));
		html.find(".bsh-increase-quantity-icon").click(this._onIncreaseItemQuantityClicked.bind(this));
		html.find(".bsh-reset-usage-die-icon").click(this._onResetUsageDieClicked.bind(this));
		html.find(".bsh-info-icon").click(onInfoIconClicked);
		html.find(".bsh-item-name").click(this._onItemNameClicked.bind(this));
		html.find(".bsh-cast-spell-icon").click(this._onCastSpellClicked.bind(this));
		html.find(".bsh-reset-spell-state-icon").click(this._onResetSpellStateClicked.bind(this));
		html.find(".bsh-reset-all-spells-icon").click(this._onResetAllSpellStatesClicked.bind(this));
		html.find(".bsh-doom-roll-icon").click(this._onRollDoomDieClicked.bind(this));
		html.find(".bsh-usage-roll-icon").click(this._onRollOtherUsageDieClicked.bind(this));
		html.find(".bsh-reset-dark-pact-icon").click(this._onResetDarkPactClicked.bind(this));
		html.find(".bsh-summon-demon-icon").click(this._onSummonDemonClicked.bind(this));
		html.find(".bsh-summon-spirit-icon").click(this._onSummonSpiritClicked.bind(this));
		html.find(".bsh-random-character-generator-button").click(this._onRandomizeMyCharacterClicked.bind(this));
		html.find(".bsh-rest-icon").click(this._onTakeRestClicked.bind(this));
		html.find(".usageselect").click(this._onUsageSelectClicked.bind(this));
		html.find(".bsh-delete-usage").click(this._onDeleteUsageClicked.bind(this));
		html.find(".bsh-add-usage-die").click(this._onAddUsageClicked.bind(this));
		
		initializeCollapsibles();
		super.activateListeners(html);
	}

	_getCustomOrigins() {
		let origins = {};

		getCustomOrigins().forEach((origin) => {
			let key = stringToKey(origin.name);

			origins[key] = {backgrounds: [].concat(origin.system.backgrounds), id: key, name: origin.name};
		});

		return(origins);
	}
	_onDeleteUsageClicked(event) {
		let d = Dialog.confirm({
			title: "Delete Usage Die",
			content: "<p>Are you sure? Also don't delete the doom die...</p>",
			yes: () => this.deleteusage(event, event.target.attributes.data.value),
			no: () => console.log("dismiss"),
			defaultYes: false
			});
	}

	_onAddUsageClicked(event) {
		new Dialog({
			title:'New Usage Die',
			content:`
			  <form>
				<div class="form-group">
				  <label>Name</label>
				  <input type='text' name='inputField'></input>
				</div>
			  </form>`,
			buttons:{
			  yes: {
				icon: "<i class='fas fa-check'></i>",
				label: `Apply Changes`
			  }},
			default:'yes',
			close: html => {
			  let result = html.find('input[name=\'inputField\']');
			  if (result.val()!== '') {
				this.addusage(event, result.val());
				}
			  }
		  }).render(true);
	}

	addusage(event, result) {
		let element = event.currentTarget.attributes["data-actor"].value;
		let actor = getActorById(element);
		let curusage = {system: {usageDie: actor.system.usageDie}}
		curusage.system.usageDie[result] = "d6"
		actor.update(curusage)
	}
	deleteusage(event, diename) {
		let element = event.currentTarget.previousElementSibling.attributes["data-actor"].value;
		let actor = getActorById(element);
		
		
		let todelkey = "system.usageDie.-=" + diename
		console.log(todelkey)
		console.log({[todelkey]: null})
		actor.update({[todelkey]: null})
		console.log(actor)
	}


	


	_onUsageSelectClicked(event) {
		// Get the selected value from the dropdown
		const selectedValue = event.target.value;
	
		
		// Extract the attribute name from the clicked select field
		const attributeName = event.currentTarget.name;
		console.log(event)
		let element = event.currentTarget;
		let actor = getActorById(element.form.attributes['data-id'].value);
		const keys = attributeName.split('.'); // Split the dot notation string into keys
		const result = {};
	
		let current = result;
	
		for (let i = 1; i < keys.length; i++) {
			const key = keys[i];
			current[key] = i === keys.length - 1 ? selectedValue : {}; // If it's the last key, assign the provided value; otherwise, create an empty object
			current = current[key];
		}
		event.preventDefault();
		let curusage = actor.system.usageDie
		console.log(curusage)
		console.log(current)
		result.id = actor.id;
		actor.update(result)
	
	}
	

	_onAttributeRollClicked(event) {
		handleRollAttributeDieEvent(event);
	}

	_onCastSpellClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.spell) {
			castSpell(element.dataset.spell);
		} else {
			console.error("Spell casting requested but requesting element does not have a spell attribute.");
		}
		return(false);
	}

	_onDecreaseItemQuantityClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.item) {
			decrementItemQuantity(element.dataset.item);
		} else {
			console.error("Decrease of item quantity requested but requesting element has no item attribute.");
		}
		return(false);
	}

	_onDeleteItemClicked(event) {
		let element = event.currentTarget;

		if(element.dataset.item) {
			deleteOwnedItem(element.dataset.item);
		} else {
			console.error("Delete item requested but requesting element has no item attribute.")
		}

		return(false);
	}

	_onRandomizeMyCharacterClicked(event) {
		let element = event.currentTarget;
		let actor   = game.actors.find((a) => a.id === element.dataset.id);

		event.preventDefault();
		if(actor) {
			randomizeCharacter(actor);
		}
	}

	_onResetDarkPactClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.actor && element.dataset.type) {
			resetDarkPact(element.dataset.actor, element.dataset.type);
		} else {
			console.error("Reset of dark pact requested but requesting element does not have an actor and/or type attribute.");
		}
		return(false);
	}

	_onResetSpellStateClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.spell) {
			resetSpellState(element.dataset.spell);
		} else {
			console.error("Spell state reset requested but requesting element does not have a spell attribute.");
		}
		return(false);
	}

	_onResetAllSpellStatesClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.actor) {
			resetSpellStatesForActor(element.dataset.actor);
		} else {
			console.error("Reset of all spell states requested but requesting element does not have an actor attribute.");
		}
		return(false);
	}

	_onSummonDemonClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.demon) {
			let rollType = "standard";

			if(event.shiftKey) {
				rollType = "advantage";
			} else if(event.ctrlKey) {
				rollType = "disadvantage";
			}
			summonDemon(element.dataset.demon, rollType);
		} else {
			console.error("Summoning of a demon was requested but requesting element does not have an actor attribute.");
		}
		return(false);
	}

	_onSummonSpiritClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.spirit) {
			let rollType = "standard";

			if(event.shiftKey) {
				rollType = "advantage";
			} else if(event.ctrlKey) {
				rollType = "disadvantage";
			}
			summonSpirit(element.dataset.spirit, rollType);
		} else {
			console.error("Summoning of a spirit was requested but requesting element does not have an actor attribute.");
		}
		return(false);
	}

	_onDieRollClicked(event) {
		handleRollDieEvent(event);
	}

	_onIncreaseItemQuantityClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.item) {
			incrementItemQuantity(element.dataset.item);
		} else {
			console.error("Increase of item quantity requested but requesting element has no item attribute.");
		}
		return(false);
	}

	_onItemNameClicked(event) {
		let element = event.currentTarget;
		event.preventDefault();
		if(element.dataset.item) {
		    let item = getOwnedItemById(element.dataset.item);
		    if(item && !item.sheet.rendered) {
		    	item.sheet.render(true);
		    }
		}
		return(false);
	}

	_onResetUsageDieClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.item) {
			resetItemUsageDie(element.dataset.item);
		} else {
			console.error("Reset of item usage die requested but requesting element has no item attribute.");
		}
		return(false);
	}

	_onRollDoomDieClicked(event) {
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.actor) {
			let actor = getActorById(element.dataset.actor);

			if(actor) {
				logDoomDieRoll(actor, event.shiftKey, event.ctrlKey)
			} else {
				console.error(`Unable to find an actor with the id '${element.dataset.actor}'.`);
			}
		} else {
			console.error("Roll of the doom die requested but requesting element has no actor id.");
		}

		return(false);
	}


	_onRollOtherUsageDieClicked(event) {
		console.log(event)
		let element = event.currentTarget;

		event.preventDefault();
		if(element.dataset.actor) {
			let actor = getActorById(element.dataset.actor);

			if(actor) {
				logOtherUsageDieRoll(actor, event.shiftKey, event.ctrlKey, event.currentTarget.attributes.dicetype.nodeValue)
			} else {
				console.error(`Unable to find an actor with the id '${element.dataset.actor}'.`);
			}
		} else {
			console.error("Roll of the usage die requested but requesting element has no actor id.");
		}

		return(false);
	}

	_onTabLabelClicked(event) {
		let element   = event.currentTarget;
		event.preventDefault();
		if(element.dataset.tab !== undefined && element.dataset.actor !== undefined) {
			let actor     = null;
			let container = Array.from(document.querySelectorAll(".bsh-character-sheet")).filter((e) => e.dataset.id === element.dataset.actor);
	
	        if(container.length === 1) {			
				let data      = {system: {tabSelected: element.dataset.tab}};

                container = container[0];
				if(!container) {
					throw("Failed to locate the character sheet container element.");
				}

		        actor = getActorById(element.dataset.actor);
		        if(!actor) {
		        	throw(`Failed to locate an actor with an id of ${container.data.id}.`);
		        }

		        data.id = actor.id;
				actor.update(data);
				this.selectTabLabel(element.dataset.tab, actor);
				this.showTabBody(element.dataset.tab, actor);
			} else {
				return(false);
			}
		}
		return(false);
	}

	_onTakeRestClicked(event) {
		let element = event.currentTarget;

        if(element.dataset.actor) {
		    if(element.dataset.type) {
		    	let actor = getActorById(element.dataset.actor);

		    	if(actor) {
		    		if(element.dataset.type === "long") {
		    			takeLongRest(actor);
		    		} else if(element.dataset.type === "short") {
		    			takeShortRest(actor);
		    		} else {
		    			console.error(`Unrecognised type '${element.dataset.type}' specified for rest.`);
		    		}
		    	} else {
		    		console.error(`Unable to locate an actor with the id ${element.dataset.actor}.`);
		    	}
		    } else {
		    	console.error("Rest requested but requesting element has no rest type data attribute.");
		    }
        } else {
        	console.error("Rest requested but requesting element has no actor data attribute.");
        }
	}

	_onUsageDieRollClicked(event) {
		return(handleRollUsageDieEvent(event));
	}

	_onWeaponRollClicked(event) {
		return(handleWeaponRollEvent(event));
	}

    _prepareCharacterData(context) {
        context.configuration                = CONFIG.configuration;
        context.configuration.classicOrigins = mergeObject({}, CLASSIC_ORIGINS);
        context.configuration.customOrigins  = this._getCustomOrigins();
        calculateCharacterData(context, CONFIG.configuration);

        context.backgrounds = getCharacterBackgrounds(this.object);
        context.consumables = context.items.filter((item) => item.type === "consumable");
        context.demons      = context.items.filter((item) => item.type === "demon");
        context.equipment   = context.items.filter((item) => item.type === "equipment");
        context.gifts       = context.items.filter((item) => item.type === "gift");
        context.spells      = context.items.filter((item) => item.type === "spell");
        context.spirits     = context.items.filter((item) => item.type === "spirit");
        context.weapons     = context.items.filter((item) => item.type === "weapon");
        context.hasDemons   = (context.demons.length > 0);
        context.hasSpells   = (context.spells.length > 0);
        context.hasSpirits  = (context.spirits.length > 0);
    }

	selectTabLabel(tabName, actor) {
		let rootElement = Array.from(document.querySelectorAll(".bsh-character-sheet")).filter((e) => e.dataset.id === actor._id);

		if(rootElement.length === 1) {
			let tabLabels = rootElement[0].getElementsByClassName("bsh-tab-label");
			for(let i = 0; i < tabLabels.length; i++) {
				if(tabLabels[i].dataset.tab === tabName) {
					tabLabels[i].classList.add("bsh-tab-selected");
				} else {
					tabLabels[i].classList.remove("bsh-tab-selected");
				}
			}
		} else {
			console.error(`Failed to locate the character sheet for actor id '${actor._id}'.`);
		}
	}

	showTabBody(tabName, actor) {
		let rootElement = Array.from(document.querySelectorAll(".bsh-character-sheet")).filter((e) => e.dataset.id === actor._id);

		if(rootElement.length === 1) {
			let tabBodies = rootElement[0].getElementsByClassName("bsh-tab-body");

			for(let i = 0; i < tabBodies.length; i++) {
				tabBodies[i].classList.add("bsh-tab-hidden");
			}
			rootElement[0].getElementsByClassName(`bsh-${tabName}-tab`)[0].classList.remove("bsh-tab-hidden");
		} else {
			console.error(`Failed to locate the character sheet for actor id '${actor._id}'.`);
		}
	}
}
