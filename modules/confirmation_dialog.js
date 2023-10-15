
export default class ConfirmationDialog extends Dialog {
    constructor(actor, confirm, settings, options) {
        let buttons = {confirm: {callback: confirm,
                                label: "Confirm"}, dismiss: {label: "Dismiss"}};

        super(Object.assign({}, settings, {buttons: buttons}));
        this._actor     = actor;
        this._options   = options;
        this._settings  = settings;
    }

  

    get actor() {
        return(this._actor);
    }

    
    // static build(actor, attribute, options={}) {
    //     let settings = Object.assign({}, options);
    //     let data     = {adjustment:    (settings.adjustment || 0),
    //                     attribute:     game.i18n.localize(`bsh.attributes.${attribute}.long`),
    //                     configuration: CONFIG.configuration,
    //                     score:         0,
    //                     threat:        (settings.threat || 0),
    //                     type:          (settings.rollType || "standard")};

    //     calculateCharacterData(actor, CONFIG.configuration);
    //     data.score     = (actor.system.calculated || actor.system.calculated)[attribute];
    //     settings.title = game.i18n.localize(`bsh.rolls.tests.${attribute}.title`);

    //     return(renderTemplate("systems/black-sword-hack/templates/roll-modal.html", data)
    //                .then((content) => {
    //                          settings.content = content;
    //                          return(new AttributeTestDialog(actor, attribute, settings, options));
    //                      }));   
    // }
}
