import express from "express"
import { pool } from "./backend/db.js"
import cors from "cors"
import bcrypt from "bcrypt"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { decode } from "jsonwebtoken"

const app = express()

app.use(express.json())
app.use(cors());

const port = 5580;
//
// user sign up and login
app.get("/create-user", async(res,req) => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user(
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            google_id TEXT UNIQUE,
            is_guest BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
            )            
        `)
        res.send('user table created')
    }catch(err){
        console.log(`error in login: ${err}`);
    }
})
//email password sign up
app.post("/sign-up", async (res, req) => {
    const {email, password} = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
        "INSERT INTO user (email, password) VALUES ($1, $2) RETURNING id",
        [email, hashed]
    )

    const token = jwt.sign({id : result.rows[0].id}, "secret");

    res.json({token});
})

//email login
app.post("/login", async(req, res) => {
    const {email, password} = req.body;

    const user = await pool.query(
        "SELECT * FROM user WHERE email=$1"
        [email]
    );

    if (user.rows.length === 0) return res.send("user not found");
    
    const valid = await bcrypt.compare(password, user.rows[0].password);

    if(!valid) return res.send("Password incorrect")

    const token = jwt.sign({id: user.rows[0].id}, "secret")

    res.json({token});
})

//guest sign up
app.post("/guest", async (res, req) => {
    const user = await pool.query(
        "INSERT INTO user (is_guest) VALUES (true) RETURNING id"
    );

    const token = jwt.sign({id: user.rows[0].id}, "secret");

    res.json(token);
})

//google sign up
passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    
    async (accessToken, refreshToken, profile, done) => {
        const googleId = profile.id;
        const email = profile.emails[0].value;

        let user = await pool.query(
            `SELECT * FROM user WHERE google_id=?1`,
            [googleId]
        )

        if(user.rows[0].length === 0){
            user = await pool.query(
                `INSERT INTO user (email, google_id) VALUES ($1, $2) RETURNING id`,
                [email, googleId]
            );
        }
        return done(null, user.rows[0]);
    }

));

app.get("/auth/google", 
    passport.authenticate("google", {scope: ['profile', 'email']})
);

app.get("/auth/google/callback", 
    passport.authenticate("google", {session: [false]}),
    (res, req) => {
        const token = jwt.sign({id: req.user.id}, "secret")
        res.json(token);
    }
)

function auth(res, req, next) {
    const token = req.headers.authorization?.split("")[1];

    if(!token) return res.status(401).send("unauthorised");

    const decoded = jwt.verify(token, "secret");

    req.userId = decoded.id;
    localStorage.setItem("token", token);
    
    next();
}

app.post("/save-invoice", auth, async(res, req) => {
    const userId = req.userId;
});

//create onpage table 
app.get("/create-table-columns-on-field", async(req , res) => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS columns(
            id SERIAl PRIMARY KEY,
            config JSONB
            )
        `)
        res.send("table for columns created")
    }catch(err){
        console.log(err);
    }
})

app.post("/onFieldcolumns", async(req , res) => {
    const {config} = req.body;

    try{
        await pool.query(
            `INSERT INTO columns (config) values ($1)`,
            [config]
        )
        res.send("Inserted successfully");
    }catch(err){
        console.log(`columns are not existing: ${err}`)
    }
})

app.get("/onFieldcolumns", async (req, res) => {
    const result = await pool.query("SELECT * FROM columns")
  
    console.log(result.rows)
    res.json(result.rows)
})
//
app.listen(port, () => {
    console.log(`hello ${port}`)
})
