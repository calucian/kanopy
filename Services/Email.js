"use strict";

let _ = require("underscore");
let os = require("os");
let path = require("path");
const fs = require("fs");

const emailServer = require("emailjs").server;
const handlebars = require("handlebars");
const mimeTypes = require("../../Helpers/mimeTypes");
let NodeZip = require("node-zip");

/**
 * Email Service which is used to send emails through SMTP
 */
class Email {

    constructor (options) {
        this.server = emailServer.connect(options);
    }

    /**
     * Send an email
     *
     * Available options:
     *  - text: Optional, fallback text if the email client does not support rendering HTML
     *  - from: Required, email address which the email was sent from
     *  - to: Required, email address to send the email to
     *  - cc: Optional, email address to cc
     *  - bcc: Optional, email address to bcc
     *  - subject: Required, subject of the email
     *  - attachment: Optional, list of attachments to send with the email
     *
     * @param object    params      A dictionary of options
     * @param function  callback    Function to call when the email has been sent
     */
    sendEmail (params, callback) {
        //If we have no body, default it to text
        var body = params.body;
        if (!body) {
            body = params.text;
        }

        //Create body attachment
        let bodyAttachment = {
            data: body,
            alternative: true
        };

        //If we have attachments, add body as first attachment
        //Otherwise, set attachments to be an array with body element
        let attachments = params.attachments;
        if (!attachments) {
            attachments = [bodyAttachment];
        } else {
            attachments.unshift(bodyAttachment);
        }

        this.server.send({
            text: params.text || "",
            from: params.from,
            to: params.to,
            cc: params.cc || null,
            bcc: params.bcc || null,
            subject: params.subject,
            attachment: attachments
        }, callback);
    }

    archiveAttachments (extracts) {
        return _.map(extracts, (extract) => {
            let zip = new NodeZip();

            zip.file(extract.filename, extract.csv);
            let filename = extract.filename + `.zip`;


            let data = zip.generate({base64: false, compression: "DEFLATE"});

            let temp = os.tmpdir();
            let zipFilePath = path.join(temp, filename);

            fs.writeFileSync(zipFilePath, data, "binary");

            return {
                path: zipFilePath,
                type: mimeTypes.ZIP,
                name: filename
            };
        });
    }

    deleteArchiveAttachments (attachments) {
        _.each(attachments, (file) => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
    }

    /**
     * Send an email, using a static HTML template
     *
     * Refer to Email#sendEmail function for possible parameters. Additional
     * options are as follows:
     *  - templatePath: Required, absolute path to the static HTML template to load
     *
     * @param object    params      A dictionary of options
     * @param function  callback    Function to call when the email has been sent
     */
    sendEmailWithStaticTemplate (params, callback) {
        fs.readFile(params.templatePath, (err, emailTemplate) => {
            if (err) {
                return callback(err);
            }

            params.body = (handlebars.compile(emailTemplate))(params.templateData);

            this.sendEmail(params, callback);
        });
    }

    /**
     * Send an email, using a handlebars template
     *
     * Refer to Email#sendEmail function for possible parameters. Additional
     * options are as follows:
     *  - templatePath: Required, absolute path to the static HTML template to load
     *  - templateData: Required, data to provide to the handlebars template when compiling it
     *
     * @param object    params      A dictionary of options
     * @param function  callback    Function to call when the email has been sent
     */
    sendEmailWithTemplate (params, callback) {
        fs.readFile(params.templatePath, (err, emailTemplate) => {
            if (err) {
                return callback(err);
            }

            params.body = emailTemplate;

            this.sendEmail(params, callback);
        });
    }

}

module.exports = Email;