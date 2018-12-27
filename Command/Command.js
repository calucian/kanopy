"use strict";

const _ = require("underscore");
const camelcase = require("camelcase");

/**
 * A base class for registering 'CLI commands'.
 */
class Command
{
    /**
     * Initializes properties and configures command.
     *
     * @param {program.Command} commander   An instance of program.command.
     * @param {Container}       container   A reference to the service container
     * @param {string}          name        The name of the Command.
     *
     * @see   https://www.npmjs.com/package/commander
     */
    constructor (commander, container, name) {
        this.commander = commander;
        this.container = container;

        this.name = name;
        this.description = "";
        this.help = "";

        this._reportFile = "";

        this.options = [];
        this.arguments = [];

        this.logger = container.get("logger");
        this.setup();
    }

    /**
     * Configures the command.
     * Needs to be overridden by classes that extend this class.
     */
    configure () {
        throw "You must override the configure() method in the concrete command class";
    }

    /**
     * Executes the command.
     * Needs to be overridden by classes that extend this class.
     */
    execute () {
        throw "You must override the execute() method in the concrete command class";
    }

    /**
     * Getter for retrieving internal Container.
     *
     * @returns {Container}
     */
    getContainer () {
        return this.container;
    }

    /**
     * Getter for retrieving internal Commander.
     *
     * @returns {Commander}
     */
    getCommander () {
        return this.commander;
    }

    /**
     * Sets up the command arguments and options, configures help option and sets the action
     * that the command will do.
     */
    setup () {
        this.configure();

        this.addOption("monitor-stats-file", Command.OPTION_VALUE_OPTIONAL, "Default option for reporting filepath", null);

        var commandArgs = this.arguments.map((argument) => {
            if (argument.type == Command.ARGUMENT_REQUIRED) {
                return "<" + argument.name + ">";
            }

            return "[" + argument.name + "]";
        }).join(" ");

        this.command = this.commander
            .command(this.name + " " + commandArgs)
            .description(this.description);

        this.options.forEach((option) => {
            var optionName = "-" + option.name + ", --" + option.name;

            if (option.type == Command.OPTION_VALUE_REQUIRED) {
                optionName += " <value>";
            } else if (option.type == Command.OPTION_VALUE_OPTIONAL) {
                optionName += " [value]";
            }

            this.command.option(optionName, option.description);
        });

        var that = this;
        this.command.action(function () {
            that.run(_.toArray(arguments));
        }).on("--help", () => {
            console.log(this.help);
        });
    }

    /**
     * Parses the arguments given to the command from the CLI and then executes the action of
     * the command.
     *
     * @param {Array} args Arguments passed when the command was called from CLI.
     */
    run (args) {
        var input   = new (require("./Input"))();
        var options = args.pop();

        this.arguments.forEach((argument, i) => {
            if (args[i] !== undefined) {
                input.setArgument(argument.name, args[i]);
            } else {
                input.setArgument(argument.name, argument.value);
            }
        });

        this.options.forEach((option) => {
            let caseName = camelcase(option.name);
            let value    = option.value;

            if (options[caseName] !== undefined) {
                value = options[caseName];
            }

            if (option.type === Command.OPTION_VALUE_NONE) {
                value = value ? true : false;
            }

            input.setOption(option.name, value);
        });

        this.execute(input);
    }

    /**
     * Setter for name property.
     *
     * @param {String} name
     *
     * @returns {Command}
     */
    setName (name) {
        this.name = name;

        return this;
    }

    /**
     * Setter for description property.
     *
     * @param   {string}    description
     *
     * @returns {Command}
     */
    setDescription (description) {
        this.description = description;

        return this;
    }

    /**
     * Adds another argument of the command.
     *
     * @param {string}  name            The argument name
     * @param {number}  mode            The argument mode: One of the Command.ARGUMENT_* constants
     * @param {string}  description     A description text
     * @param {*}       defaultValue    Default value for case when argument is not specified CLI
     *
     * @returns {Command}
     */
    addArgument (name, mode, description, defaultValue) {
        if (mode != Command.ARGUMENT_REQUIRED) {
            mode = Command.ARGUMENT_OPTIONAL;
        }

        this.arguments.push({
            name:        name,
            type:        mode,
            description: description,
            value:       defaultValue
        });

        return this;
    }

    /**
     * Adds another option of the command.
     *
     * @param {string}  name            The option name
     * @param {number}  mode            The option mode: One of the Command.OPTION_VALUE_* constants
     * @param {string}  description     A description text
     * @param {*}       defaultValue    Default value of the option when the option is not specified in CLI
     *
     * @returns {Command}
     */
    addOption (name, mode, description, defaultValue) {
        if (mode != Command.OPTION_VALUE_REQUIRED) {
            mode = Command.OPTION_VALUE_OPTIONAL;
        }

        this.options.push({
            name:        name,
            type:        mode,
            description: description,
            value:       defaultValue
        });

        return this;
    }

    /**
     * Sets the help for the command.
     *
     * @param {String} text Text to be displayed for a command when help is called.
     *
     * @returns {Command}
     */
    setHelp (text) {
        this.help = text;

        return this;
    }
}

Command.OPTION_VALUE_REQUIRED = 1;
Command.OPTION_VALUE_OPTIONAL = 2;
Command.OPTION_VALUE_NONE = 3;
Command.ARGUMENT_REQUIRED = 4;
Command.ARGUMENT_OPTIONAL = 5;

module.exports = Command;