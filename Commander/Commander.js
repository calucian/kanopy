"use strict";

require("colors");
var program = require("commander");

program.Command.prototype.commandHelp = function () {
    if (!this.commands.length) return "";

    var commands = this.commands.filter(function (cmd) {
        return !cmd._noHelp;
    }).map(function (cmd) {
        var args = cmd._args.map(function (arg) {
            return arg.required ? "<" + arg.name + (arg.variadic === true ? "..." : "") + ">" : "[" + arg.name + (arg.variadic === true ? "..." : "") + "]";
        }).join(" ");

        return [cmd._name.green + (cmd._alias ? "|" + cmd._alias : "").green + (cmd.options.length ? " [options]" : "").green + " " + args.green + "      ", (cmd.description() || "No description available").white];
    });

    var width = commands.reduce(function (max, command) {
        return Math.max(max, command[0].length);
    }, 0);

    return ["", "  Available Commands:".yellow, commands.map(function (cmd) {
        var desc = cmd[1] ? "  " + cmd[1] : "";
        return "\t" + cmd[0] + Array(Math.max(0, width - cmd[0].length) + 1).join(" ") + desc;
    }).join("\n").replace(/^/gm, "    ").green, ""].join("\n");
};

program.Command.prototype.helpInformation = function () {
    var desc        = this._description ? ["\t" + this._description, ""] : [];
    var cmdName     = this._alias ? this._name + "|" + this._alias : this._name;
    var commandHelp = this.commandHelp();
    var cmds        = commandHelp ? [commandHelp] : [];
    var usage       = ["", "  Usage: ".yellow, "\t" + cmdName.green + " " + this.usage().green, ""];
    var options     = ["  Options:".yellow, "    " + this.optionHelp().replace(/^/gm, "\t").green];

    return usage
        .concat(desc)
        .concat(options)
        .concat(cmds)
        .concat("\n")
        .join("\n");
};

program.Command.prototype.outputHelp = function (cb) {
    if (!cb) {
        cb = function (passthru) {
            return passthru;
        };
    }

    process.stdout.write(cb(this.helpInformation()));
    this.emit("--help");
};

module.exports = program;