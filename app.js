const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = 4000;
const saltRounds = 10;

/*

Installer :
npm install express
npm install body-parser
npm install bcrypt
npm install path
npm install mysql
npm install jsonwebtoken
npm install cookie-parser

*/

//View Engine
app.set("view engine", "pug");

//Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const database = mysql.createConnection({
  host: "localhost",
  user: "MelvunxAndMarsi",
  password: "MaMaMilla930",
  database: "starmation",
});

database.connect((err) => {
  if (err) {
    console.error("connection to Starmation database failed", err);
  } else {
    console.log("Connected to Starmation database !");
  }
});

const secretKey = "StarSecret-Endromede";
//threeHours --> temps avant expiration du token, durée de 3h
const ThreeHours = 60 * 60 * 3;

function generateToken(username) {
  const payload = { username };
  const options = { expiresIn: ThreeHours };
  return jwt.sign(payload, secretKey, options);
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.username;
  } catch (err) {
    return null;
  }
}

//Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// changer pour permettre la connection seulement aux admin
app.get(
  "/admin",
  (req, res, next) => {
    // get the token from the cookie
    const token = req.cookies.jwt;
    console.log("\nToken verification...");

    const decodedUsername = verifyToken(token);

    // Verify the token
    if (decodedUsername) {
      // If the token is valid, it goes to the next middleware
      console.log(
        `\nToken validated! The user ${decodedUsername} is identified`
      );
      next();
    } else {
      // if the token is not valid, redirect to the login page
      console.log("Invalid token");
      res.render("login", { error: "Invalid or expired token" });
    }
  },
  (req, res, next) => {
    // get the userData from the cookie
    const userData = req.cookies.userData;

    if (userData) {
      // Parse userData to get the user's role
      const user = JSON.parse(userData)[0]; // Assuming userData is an array with one user object
      const userRole = user.role_name;

      if (userRole === "admin") {
        console.log(
          `\nUser verification successful \nUser ${user.username} with role ${userRole} is accessing the admin page.`
        );
        database.query(
          "SELECT * FROM account JOIN person USING(Id_P)",
          (err, results) => {
            if (err) throw err;
            console.log("Database query results:", results);
            res.render("admin", { users: JSON.parse(userData), l: results });
          }
        );
      } else {
        console.log(
          `Access denied for user ${user.username} with role ${userRole}.`
        );
        res.render("stars", {
          users: JSON.parse(userData),
          errorAdmin: "Access denied: Admins only",
        });
      }
    } else {
      console.log("User data not found");
      res.render("login", { error: "Session expired" });
    }
  }
);

app.delete("/delete/:Id_P", (req, res) => {
  const Id_P = req.params.Id_P;
  const sqlDeleteAccount = "DELETE FROM account WHERE Id_P = ?";
  const sqlDeletePerson = "DELETE FROM person WHERE Id_P = ?";

  database.query(sqlDeleteAccount, [Id_P], function (err, result) {
    if (err) {
      console.error("An error occurred while deleting from account:", err);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting from account" });
    }
    database.query(sqlDeletePerson, [Id_P], function (err, result) {
      if (err) {
        console.error("An error occurred while deleting from person:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while deleting from person" });
      }
      console.log(
        `Deleted Account and associated personal info with Id ${Id_P}`
      );
      res.status(200).json({ "delete done": true });
    });
  });
});

//Lorsque l'on se déconnecte, le cookie est supprimé
app.get("/logout", (req, res) => {
  // Récupérer les données utilisateur du cookie
  const userData = req.cookies.userData;

  if (userData) {
    // Parse userData pour obtenir le nom d'utilisateur
    const user = JSON.parse(userData)[0]; // Assuming userData is an array with one user object
    const username = user.username;

    // Afficher le nom d'utilisateur dans la console
    console.log(`\nUser ${username} has logged out`);
  } else {
    console.log("No user data found");
  }

  // Détruire les cookies
  res.cookie("jwt", " ", { maxAge: 1 });
  res.cookie("userData", " ", { maxAge: 1 });
  console.log("\nCookies destroyed");

  // Redirection vers la page d'accueil
  res.redirect("/");
});

//middleware de vérification --> vérifie si le token est présent pour connecter l'utilisateur
app.get(
  "/solarsyst",
  (req, res, next) => {
    // get the token from the cookie
    const token = req.cookies.jwt;
    console.log("\nToken verification...");

    const decodedUsername = verifyToken(token);

    // Verify the token
    if (decodedUsername) {
      // If the token is valid, it goes to the next middleware
      console.log(
        `\nToken validate ! \nThe user ${decodedUsername} is identified`
      );
      next();
    } else {
      // if the token is not valid, redirect to the login page
      console.log("Invalid token");
      res.render("login", { error: "Invalid or expired token" });
    }
  },
  (req, res, next) => {
    const userData = req.cookies.userData;

    if (userData) {
      // get the user
      console.log("\nUser verification...");
      res.render("solarsyst", { users: JSON.parse(userData) });
      console.log("\nUser validate !");
    } else {
      console.log("User data not found");
      res.render("login", { error: "Session expired" });
    }
  }
);

app.get(
  "/stars",
  (req, res, next) => {
    // get the token from the cookie
    const token = req.cookies.jwt;
    console.log("\nToken verification...");

    const decodedUsername = verifyToken(token);

    // Verify the token
    if (decodedUsername) {
      // If the token is valid, it goes to the next middleware
      console.log(
        `\nToken validate ! \nThe user ${decodedUsername} is identified`
      );

      next();
    } else {
      // if the token is not valid, redirect to the login page
      console.log("Invalid token");
      res.render("login", { error: "Invalid or expired token" });
    }
  },
  (req, res, next) => {
    // get the userDate from the cookie
    const userData = req.cookies.userData;

    if (userData) {
      // get the user
      console.log("\nUser verification...");
      res.render("stars", { users: JSON.parse(userData) });
      console.log("\nUser validate !");
    } else {
      console.log("User data not found");
      res.render("login", { error: "Session expired" });
    }
  }
);

app.get(
  "/constellation",
  (req, res, next) => {
    const token = req.cookies.jwt;
    console.log("\nToken verification...");

    const decodedUsername = verifyToken(token);

    // Verify the token
    if (decodedUsername) {
      // If the token is valid, it goes to the next middleware
      console.log(
        `\nToken validate ! \nThe user ${decodedUsername} is identified`
      );
      next();
    } else {
      // if the token is not valid, redirect to the login page
      console.log("Invalid token");
      res.render("login", { error: "Invalid or expired token" });
    }
  },
  (req, res, next) => {
    // get the userDate from the cookie
    const userData = req.cookies.userData;

    if (userData) {
      // get the user
      console.log("\nUser verification...");
      res.render("constellation", { users: JSON.parse(userData) });
      console.log("\nUser validate !");
    } else {
      console.log("User data not found");
      res.render("login", { error: "Session expired" });
    }
  }
);

//Page custom du site pour la création du système solaire
app.get(
  "/custom",
  (req, res, next) => {
    const token = req.cookies.jwt;
    console.log("\nToken verification...");

    const decodedUsername = verifyToken(token);

    if (decodedUsername) {
      console.log(
        `\nToken validate ! \nThe user ${decodedUsername} is identified`
      );
      next();
    } else {
      console.log("Invalid token");
      res.render("login", { error: "Invalid or expired token" });
    }
  },
  (req, res, next) => {
    const userData = req.cookies.userData;

    if (userData) {
      console.log("\nUser verification...");
      res.locals.users = JSON.parse(userData);
      console.log("\nUser validate !");
      next();
    } else {
      console.log("User data not found");
      res.render("login", { error: "Session expired" });
    }
  },
  (req, res) => {
    const token = req.cookies.jwt;
    const username = verifyToken(token);

    if (!username) {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      const sqlGetSolarSystemId = `
        SELECT c_s_s.Id_Css 
        FROM custom_solar_system c_s_s
        INNER JOIN account a ON c_s_s.Id_Acc = a.Id_Acc
        WHERE a.username = ?`;

      database.query(sqlGetSolarSystemId, [username], (error, result) => {
        if (error) {
          console.error("Database loading failed : ", error);
          return res.status(500).json({ error: "Database Error" });
        } else if (!result[0]) {
          // No custom solar system found, render the page with an empty list
          console.log("No custom solar system found for this user.");
          res.render("custom", { solarSystem: [] });
        } else {
          const Id_Css = result[0].Id_Css;
          const sqlPlanetDisplay = `
                SELECT a_o.*, 
                c_s_s.name_Solar_System, c_s_s.description, c_s_s.created_at, c_s_s.astral_count
                FROM astral_object a_o 
                INNER JOIN custom_solar_system c_s_s ON a_o.Id_Css = c_s_s.Id_Css 
                WHERE c_s_s.Id_Css = ?`;

          database.query(sqlPlanetDisplay, [Id_Css], (error, sqlResults) => {
            if (error) {
              console.error("Database loading failed : ", error);
              return res.status(500).json({ error: "Database Error" });
            } else {
              console.log("Database load successfuly ! \nSolar system updated");
              res.render("custom", {
                solarSystem: sqlResults.length > 0 ? sqlResults : [],
              });
            }
          });
        }
      });
    }
  }
);

//Formulaire de création de compte
app.post("/toregister", (req, res) => {
  const {
    name,
    lastname,
    birth_date,
    username,
    email,
    password,
    confirmPassword,
    role_id,
  } = req.body;

  //requête pour vérifier si le nom de l'utilisateur est déjà utilisé dans la base de donnée
  const uniqueUser = "SELECT username FROM account WHERE username = ?";

  //requête pour vérifier si l'email est déjà utilisé dans la base de donnée
  const uniqueEmail = "SELECT email FROM account WHERE email = ?";

  //insertion des éléments dans la table person
  const sqlPerson =
    "INSERT INTO person (name, lastname, birth_date) VALUES (?, ?, ?)";

  //insertion des éléments dans la table account avec la clé étrangère Id_P (le LAST_INSERT_ID() qui reprend le dernier id créer pour le lier à la table account)
  const sqlAccount =
    "INSERT INTO account (username, email, password, role_id,Id_P) VALUES(?, ?, ?, ?, LAST_INSERT_ID())";

  if (password.length < 5) {
    // S'il y a une erreur, on affiche le message d'erreur sur le formule (le if error -> p.error= error)
    return res.render("register", { error: "5 character minimum !" });
  } else if (password !== confirmPassword) {
    return res.render("register", { error: "Passwords do not match" });
  }
  // Vérification username
  database.query(uniqueUser, [username], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Error" });
    } else if (results.length > 0) {
      console.log(`already taken the username ${username}`);
      return res.render("register", {
        error: "This username is already taken !",
      });
    } else {
      // Vérification email
      database.query(uniqueEmail, [email], (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "An error occurred" });
        } else if (results.length > 0) {
          console.log(`already taken the email ${email}`);
          return res.render("register", {
            error: "This email is already taken !",
          });
        } else {
          // Password hashing
          bcrypt
            .genSalt(saltRounds)
            .then((salt) => {
              console.log("Salt : ", salt);
              return bcrypt.hash(password, salt);
            })
            .then((hash) => {
              console.log("Hashed password : ", hash);
              // Promise.all --> exécuter toutes les requêtes simultanément pour les stocker dans la bdd
              return Promise.all([
                database.query(sqlPerson, [name, lastname, birth_date]),
                database.query(sqlAccount, [username, email, hash, role_id]),
              ]);
            })
            .then(() => {
              console.log(
                `New user: ${username}, ${name}, ${birth_date}, ${email}`
              );
              //Génération du token
              const token = generateToken(username);
              /*
                Géneration du cookie
                On stock l'information du token dans le cookie
                httpOnly --> Permettre (oui avec false, non avec true) de voir l'information du cookie depuis la page web
                maxAge --> Durée de vie du cookie ici la même que le token soit 3h | maxAge est en ms donc on multiplie par 1000
                */
              res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: ThreeHours * 1000,
              });
              console.log("Cookie created");
              res.redirect("/login");
            })
            .catch((error) => {
              console.error(error);
              res.status(500).json({ message: "An error occurred" });
            });
        }
      });
    }
  });
});

//Connexion à la page principale
app.post("/tologin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  /*
    Objectif de la requête --> Sélectionner les éléments de la table account et de la table person
    pour envoyer les informations de l'utilisateur en 1 seul requête
     */
  const sqlLogin = `
    SELECT p.name, p.lastname, a.username, p.birth_date, a.password, a.email, r.role_name
    FROM person p
    INNER JOIN account a ON p.Id_P = a.Id_P
    INNER JOIN role r ON a.role_id = r.Id_Role
    WHERE a.username = ?`;

  database.query(sqlLogin, [username], (err, sqlResults) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "An error occurred" });
    } else if (sqlResults.length === 0) {
      // Si aucun utilisateur n'est trouvé avec ce nom d'utilisateur ou cette adresse email
      return res.render("login", { error: "Invalid username" });
    } else {
      const user = sqlResults[0];
      const hashedPassword = user.password;
      // Vérification du mot de passe
      bcrypt
        .compare(password, hashedPassword)
        .then((passwordMatch) => {
          if (passwordMatch) {
            // Si le mot de passe est correct
            const token = generateToken(user.username);
            console.log("generated token: ", token);
            // Enregistrement du token dans la session
            const decodedUsername = verifyToken(token);
            console.log("\nDecoded username: ", decodedUsername);
            if (decodedUsername === user.username) {
              console.log(
                `${decodedUsername} is connected with the email ${user.email}`
              );
              res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: ThreeHours * 1000,
              });
              console.log("Token cookie created ! \nCreating user data...");
              res.cookie("userData", JSON.stringify(sqlResults), {
                httpOnly: true,
                maxAge: ThreeHours * 1000,
              });
              console.log("User data saved !");
              res.redirect("/stars");
            } else {
              res.render("login", { error: "Invalid token" });
            }
          } else {
            res.render("login", { error: "Invalid password" });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "an error occurred" });
        });
    }
  });
});

app.post("/become-admin", (req, res) => {
  const secretCode = req.body.secretCode;
  const correctSecretCode = "nXz9${z";
  const token = req.cookies.jwt;
  const username = verifyToken(token);

  if (!username) {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (secretCode === correctSecretCode) {
    // Met à jour le rôle de l'utilisateur dans la base de données
    const updateRoleQuery = "UPDATE account SET role_id = ? WHERE username = ?";
    const adminRoleId = 2; // ID du rôle administrateur, à ajuster selon votre base de données

    database.query(
      updateRoleQuery,
      [adminRoleId, username],
      (error, results) => {
        if (error) {
          console.error("Database update error:", error);
          return res.status(500).json({ error: "Database error" });
        }
        // Met à jour le cookie userData
        const userDataQuery = `
            SELECT p.name, p.lastname, a.username, p.birth_date, a.email, r.role_name
            FROM person p
            INNER JOIN account a ON p.Id_P = a.Id_P
            INNER JOIN role r ON a.role_id = r.Id_Role
            WHERE a.username = ?`;

        database.query(userDataQuery, [username], (error, userDataResults) => {
          if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ error: "Database error" });
          }

          console.log(`full result : ${userDataResults}`);
          res.cookie("userData", JSON.stringify(userDataResults), {
            httpOnly: false,
            maxAge: ThreeHours * 1000,
          });
          console.log("User role updated to admin and cookie refreshed");
          res.redirect("/stars"); // Redirection vers la page de paramètres ou une autre page
        });
      }
    );
  } else {
    res.render("stars", {
      error: "Incorrect secret code",
      users: JSON.parse(req.cookies.userData),
    });
  }
});

app.post("/createCustomSolarSystem", (req, res) => {
  const { name_Solar_System, description } = req.body;
  const token = req.cookies.jwt;
  const username = verifyToken(token);

  if (!username) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Requête pour insérer le nouveau système solaire personnalisé dans la base de données
  const sqlCss =
    "INSERT INTO Custom_Solar_System (name_Solar_System, description, Id_Acc) VALUES (?, ?, (SELECT Id_Acc FROM Account WHERE username = ?))";

  database.query(
    sqlCss,
    [name_Solar_System, description, username],
    (error, CustomSolarSystem) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Database error" });
      } else {
        // res.cookie('userCss', JSON.stringify(CustomSolarSystem), { httpOnly: true, maxAge: ThreeHours * 1000});
        // console.log('Cookie CustomSolarSystem created')
        console.log(`
            \nCustom solar system created successfully !
            \nSolar system info
                Solar system name : ${name_Solar_System}
                Solar systeme description : ${description}
            `);
        res.redirect("/custom");
      }
    }
  );
});

app.post("/addPlanet", (req, res) => {
  const { astral_name, nature_object, diameter, distance } = req.body;
  const token = req.cookies.jwt;
  const username = verifyToken(token);

  if (!username) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Requête pour insérer la nouvelle planète dans la base de données
  const insertPlanetQuery =
    "INSERT INTO Astral_Object (astral_name, nature_object, diameter, distance, Id_Css) VALUES (?, ?, ?, ?, (SELECT Id_Css FROM Custom_Solar_System WHERE Id_Acc = (SELECT Id_Acc FROM Account WHERE username = ?)))";

  database.query(
    insertPlanetQuery,
    [astral_name, nature_object, diameter, distance, username],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ error: "Database error" });
      }

      // Récupérer l'ID de la nouvelle planète insérée
      const newPlanetId = results.insertId;

      // Mettre à jour l'ID du système solaire personnalisé dans la table Custom_Solar_System
      const updateCustomSolarSystemQuery = `
            UPDATE Custom_Solar_System 
            SET astral_count = (
                SELECT COUNT(*) FROM Astral_Object 
                WHERE Id_Css = (SELECT Id_Css FROM Account WHERE username = ?)
            ),
            Id_AO = ?
            WHERE Id_Acc = (SELECT Id_Acc FROM Account WHERE username = ?)
        `;

      database.query(
        updateCustomSolarSystemQuery,
        [username, newPlanetId, username],
        (error, updateResults) => {
          if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error" });
          }

          console.log(`\nPlanet added successfully !
            \nPlanet info
                Planet name : ${astral_name}
                Planet nature : ${nature_object}
                Planet diameter : ${diameter}
                Planet distance : ${distance}
            `);
          res.redirect("/custom"); // Redirige vers la page custom ou une autre page appropriée
        }
      );
    }
  );
});

app.post("/editAstral/:Id_AO", (req, res) => {
  const listId = req.params.Id_AO;
  const { astral_name, nature_object, diameter, distance } = req.body;

  const sqlEdit = `UPDATE Astral_Object 
    SET astral_name = ?, nature_object = ?, diameter = ?, distance = ?
    WHERE Id_AO = ?`;
  database.query(
    sqlEdit,
    [astral_name, nature_object, diameter, distance, listId],
    (error, result) => {
      if (error) {
        console.error("Error updating astral object ", error);
        res
          .status(500)
          .send("An error occurred while updating the astral object");
      } else {
        console.log(`\nAstral object updated successfully !
            \nAstral object info
            Astral object name : ${astral_name}
            Astral object nature : ${nature_object}
            Astral object diameter : ${diameter}
            Astral object distance : ${distance}
            `);
        res.redirect("/custom");
      }
    }
  );
});

app.delete("/deleteAstral/:Id_AO", (req, res) => {
  const Id_AO = req.params.Id_AO;
  console.log(`Received request to delete astral object with ID: ${Id_AO}`);

  const sqlDelete = `DELETE FROM Astral_Object WHERE Id_AO = ?`;
  database.query(sqlDelete, [Id_AO], (error, result) => {
    if (error) {
      console.error("Error deleting astral object: ", error);
      res
        .status(500)
        .send({ error: "An error occurred while deleting the astral object" });
    } else {
      console.log(`Astral object with ID ${Id_AO} deleted successfully!`);
      res.status(200).send({ done: "/" });
    }
  });
});

// app.delete('/delete/:Id_Acc', (req, res) => {
//     const Id_Acc = req.params.Id_Acc;
//     database.query("DELETE a, p FROM account a LEFT JOIN person p ON a.Id_Acc = p.Id_Acc WHERE a.Id_Acc = ?", [Id_Acc], function(err, result){
//         if (err) {
//             console.error(err);
//             res.status(500).json({ error: "An error occurred " });
//             return;
//         }
//         console.log(`Deleted Account and associated personal info with Id ${Id_Acc}`);
//         res.status(200).json({ "delete done": true });
//     });
// });
