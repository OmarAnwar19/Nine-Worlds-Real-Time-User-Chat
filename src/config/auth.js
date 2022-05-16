//this file acts as an auth guard, which allows us to check if a user
//is authenticated before letting them acess the rest of the website

//our function takes in req, res, and next to move on
module.exports = {
  //if the user request has isAuthenticated in it (provided by passport)
  ensureAuthenticated: function (req, res, next) {
    //if so, then just call next, no errors, let them access the app
    if (req.isAuthenticated()) {
      return next();
    }
    //if not, send an error message, and redirect
    req.flash("error_msg", "Please log in to access Nine Worlds Chat");
    res.redirect("/users/login");
  },
};

//by exporting this method, we can then use it as middleware on any
//route, and it will verify user authentication before allowing access
