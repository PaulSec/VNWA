exports.redirect = (req, res, url) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.writeHead(301, {Location: url});
    res.end();
}