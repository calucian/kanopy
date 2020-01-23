class NotFoundException extends Error {
}

class ForwardException extends Error {

}
class RedirectException extends Error {

}


/* @TODO: Full fledged exception with logging */

module.exports = {
    NotFoundException,
    ForwardException,
    RedirectException
};