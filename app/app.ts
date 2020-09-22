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
import * as tweetController from './controllers/tweet'

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
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: SESSION_SECRET!,
		store: new MongoStore({
			url: mongoUrl!,
			autoReconnect: true,
		}),
	})
)
app.use(passport.initialize())
app.use(passport.session())

app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.post('/login', userController.postLogin)
app.post('/signup', userController.postSignup)
app.get('/me', passportConfig.isAuthenticated, userController.getMe)
app.get('/users/:id', passportConfig.isAuthenticated, userController.getUser)
app.post('/logout', passportConfig.isAuthenticated, userController.logout)

app.post('/follow/:id', passportConfig.isAuthenticated, userController.addFollow)
app.delete('/follow/:id', passportConfig.isAuthenticated, userController.removeFollow)

app.post('/tweet', passportConfig.isAuthenticated, tweetController.addTweet)
app.delete('/tweet/:id', passportConfig.isAuthenticated, tweetController.removeTweet)
app.delete('/tweet/:id', passportConfig.isAuthenticated, tweetController.getTweet)
app.get('/tweet/:id', passportConfig.isAuthenticated, tweetController.getTweet)
app.get('/tweets', passportConfig.isAuthenticated, tweetController.getTweets)
app.patch('/tweet/:id', passportConfig.isAuthenticated, tweetController.updateTweet)

app.post('/tweet/:id/comment', passportConfig.isAuthenticated, tweetController.addTweetComment)
app.delete('/tweet/:id/comment/:commentId', passportConfig.isAuthenticated, tweetController.removeTweetComment)
app.patch('/tweet/:id/comment/:commentId', passportConfig.isAuthenticated, tweetController.updateTweetComment)

app.listen(port, function () {
	console.log(`Example app listening on port ${port}!`)
})
