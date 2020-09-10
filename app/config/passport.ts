import passport from 'passport'
import passportLocal from 'passport-local'

import { User, UserDocument } from '../models/user'
import { Request, Response, NextFunction } from 'express'

const LocalStrategy = passportLocal.Strategy

passport.serializeUser<any, any>((user: UserDocument, done) => {
	done(undefined, user.id)
})

passport.deserializeUser((id, done) => {
	User.findById(id, (err: Error, user: UserDocument) => {
		done(err, user)
	})
})

/**
 * Sign in using Email and Password.
 */
passport.use(
	new LocalStrategy(
		{ usernameField: 'email' },
		(email: string, password: string, done) => {
			User.findOne(
				{ email: email.toLowerCase() },
				(err: Error, user: any) => {
					if (err) {
						return done(err)
					}
					if (!user) {
						return done(undefined, false, {
							message: `Email ${email} not found.`,
						})
					}
					user.comparePassword(
						password,
						(err: Error, isMatch: boolean) => {
							if (err) {
								return done(err)
							}
							if (isMatch) {
								return done(undefined, user)
							}
							return done(undefined, false, {
								message: 'Invalid email or password.',
							})
						}
					)
				}
			)
		}
	)
)

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (req.isAuthenticated()) {
		return next()
	}
	res.status(401).send({ error: 'Not authenticated' })
}
