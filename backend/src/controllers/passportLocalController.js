const passport = require("passport")
const passportLocal = require("passport-local")
const loginService = require("../services/loginService")
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

let localStrategy = passportLocal.Strategy
console.log("PASSEI AQUI")

let initPassportLocal = () => {
    passport.use('login',new localStrategy({
        usernameField: 'id',
        passwordField: 'password',
        passReqToCallback: true
    }, 
        async (req, id, password, done) => {
            console.log("PASSEI AQUI2")

            try {
                console.log("problema aqui5")
                console.log("*****aqui init passport local "+ id)
                console.log("*****aqui "+ password)


                // let user = await loginService.findUserByEmail(email);
                let user = null
                if(req.body.role === "student"){
                  console.log("appeared")
                  user = await loginService.findStudentById(id);
                }; 

                if (req.body.role === "collaborator"){
                  user = await loginService.findCollaboratorById(id);

                }

                if(!user){
                  console.log(`This user email "${id}"" does not exist`)

                    // return done(null, false, req.flash("errors", `This user email "${email}"" does not exist`))
                    return done(null, false, { message: `This user email "${id}"" does not exist` })

                }

                if(user) {

                  console.log('*********o user é' + JSON.stringify(user) + '********')
                  

                    //compare password
                    let match = await loginService.comparePasswordUser(user, password)
                    if (match === true){
                        console.log("passou da comparepassword user")

                        // return done(null, user, null)
                        
                        return done(null, user, { message: "Successfully logged in"})

                    } else {
                        console.log("problema aqui3")

                        // return done(null, false, req.flash("errors", match))
                        return done(null, false, { message: "Wrong password"})


                    }
                }
            } catch (err) {
                console.log(err)

                return done(null, false, err)
            }
        }
        
        ));
}

passport.serializeUser((user, done) => {
  console.log("serialize user " + JSON.stringify(user.id))
    done(null, user.RASTUD);
    
});

passport.deserializeUser((id, done) => {
    loginService.findStudentById(id).then((user) => {
        return done(null, user);
    }).catch(error => {
        return done(error, null)
    });
});



passport.use(
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
    },
    async (token, done) => {
      try {
        console.log("AAAAAA"+JSON.stringify(token.user))
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
    },
    async (token, done) => {
      try {
        if (!token.user) {
          return done(null, false, { message: 'User not found in token' });
        }
        console.log("the token user is "+JSON.stringify(token.user))

        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    }
  )

  

module.exports = {
    initPassportLocal: initPassportLocal
}