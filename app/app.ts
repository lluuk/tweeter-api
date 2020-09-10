import express from 'express'
import compression from 'compression' // compresses requests
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'
import bluebird from 'bluebird'
import passport from 'passport'
import session from 'express-session'
import mongo from 'connect-mongo'

import { MONGODB_URI, SESSION_SECRET } from './utils/secrets'
import logger from './utils/logger'

// API keys and Passport configuration
import * as passportConfig from './config/passport'

// Controllers (route handlers)
import * as userController from './controllers/user'

const MongoStore = mongo(session)

// Connect to MongoDB
const mongoUrl = MONGODB_URI
mongoose.Promise = bluebird

mongoose
	.connect(mongoUrl!, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		logger.debug('Succesfully conected to db', mongoUrl)
		/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
	})
	.catch((err) => {
		logger.error(
			`MongoDB connection error. Please make sure MongoDB is running. ${err}`
		)
		process.exit()
	})

const app: express.Application = express()

const port: String | Number = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET!,
    store: new MongoStore({
        url: mongoUrl!,
        autoReconnect: true
    })
}));
app.use(passport.initialize())
app.use(passport.session())

app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.post('/login', userController.postLogin)
app.post('/signup', userController.postSignup)

app.listen(port, function () {
	console.log(`Example app listening on port ${port}!`)
})
