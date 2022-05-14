//to make sure we are logged in
module.exports = {
  //check the user is authenticated
  ensureAuthenticated: function (req, res, next) {
    //if so, then just call next, no errors
    if (req.isAuthenticated()) {
      return next();
    }
    //if not, send an error message, and redirect
    req.flash("error_msg", "Please log in to access Nine Worlds Chat");
    res.redirect("/users/login");
  },
};
