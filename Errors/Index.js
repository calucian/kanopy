class NotFoundException extends Error {
}

class ForwardException extends Error {

}

/* @TODO: Full fledged exception with logging */

module.exports = {
    NotFoundException,
    RedirectException
};