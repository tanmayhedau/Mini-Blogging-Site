const authorModel = require("../Models/AuthorModel")
const jwt = require('jsonwebtoken')
const {isValid, isValidEmail, isValidPassword, isValidRequest, regixValidator} = require("../validations/validators")


//==============================================================createAuthor=======================================================================


const createAuthor = async function (req, res) {

    try {
        let data = req.body

        if (!isValidRequest(data)) {
            return res
                .status(400)
                .send({ status: false, message: "author data is required" });
        }
        //using desturcturing
        const { fname, lname, title, email, password } = data;

        //data should not have more than 5keys as per outhorSchema (edge case)
        if (Object.keys(data).length > 5) {
            return res.
                  status(400).
                  send({ status: false, message: "Invalid data entry inside request body" })
        }

        if (!isValid(fname) || !regixValidator(fname)) {
            return res
                .status(400)
                .send({ status: false, message: "first name is required or its should contain alphabets or you have given some blank spaces at start and end" })
        }

        if (!isValid(lname) || !regixValidator(lname)) {
            return res
                .status(400)
                .send({ status: false, message: "last name is required or its should contain character" })
        }

        if (!isValid(title)) {
            return res
                .status(400)
                .send({ status: false, message: "Title is required" })
        }

        if (!["Mr", "Mrs", "Miss"].includes(title)) {
            return res
                .status(400)
                .send({ status: false, message: "Title should contain Mr, Mrs, Miss" })
        }

        if (!isValid(email)) {
            return res
                .status(400)
                .send({ status: false, message: "email is required" })
        }

        if (!isValidEmail(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Enter a valid email address" })
        }

        const isEmailUnique = await authorModel.findOne({ email: email })

        if (isEmailUnique) {
            return res
                .status(409)
                .send({ status: false, message: "Email already exits" });
        }

        if (!isValid(password)) {
            return res
                .status(400)
                .send({ status: false, message: "password is required" })
        }

        if (!isValidPassword(password)) {
            return res
                .status(400)
                .send({ status: false, message: "Enter a valid password" })
        }
        
        const newAuthor = await authorModel.create(data);
        return res
            .status(201)
            .send({ status: true, message: "author registered successfully", data: newAuthor });

    } catch (err) {
        res.status(500).send({ err: err.message })

    }
}
//============================================================loginAuthor=====================================================================
// POST /login
// Allow an author to login with their email and password. On a successful login attempt return a JWT token contatining the authorId in response body 
// If the credentials are incorrect return a suitable error message with a valid HTTP status code

const loginAuthor = async function (req, res) {
    try {
        let Email = req.body.email;
        let Password = req.body.password;

        if (!Email) {
            return res.status(400).send({ status: false, message: "Email is mandatory" })
        }

        if (!Password) {
            return res.status(400).send({ status: false, message: "Password is mandatory" })
        }

        if (!isValidEmail(Email)) {
            return res.status(400).send({ status: false, message: "Email format or pattern is invalid" })
        }
        if (!isValidPassword(Password)) {
            return res.status(400).send({status:false, message: "Password should be min 6 and max 20 character.It contains atleast--> 1 Uppercase letter, 1 Lowercase letter, 1 Number, 1 Special character" })
        }

        let Author = await authorModel.findOne({ email: Email, password: Password });

        if (!Author)
            return res.status(400).send({
                status: false,
                message: "Email or password is not correct",
            });

        let token = jwt.sign(
            {
                authorId: Author._id.toString(),
                batch: "Plutonium",
                group: 3,
            },
            "Project-1"
        );
        res.status(201).send({ status: true, data: token });
    }
    catch (err) {
        res.status(500).send({ message: "Error", error: err.message })
    };
}
module.exports =  {createAuthor,loginAuthor}
