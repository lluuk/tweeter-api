import crypto from 'crypto'
import passport from 'passport'
import { Request, Response, NextFunction } from 'express'
import { IVerifyOptions } from 'passport-local'
import { WriteError } from 'mongodb'

import { User, UserDocument, AuthToken } from '../models/user'

import '../config/passport'

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		'local',
		(err: Error, user: UserDocument, info: IVerifyOptions) => {
			if (err) {
				return next(err)
			}
			if (!user) {
				res.status(400).send(info.message)
			}
			req.logIn(user, (err) => {
				if (err) {
					return next(err)
				}
				res.send({ user })
			})
		}
	)(req, res, next)
}

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Log out.
 * @route post /logout
 */
export const logout = (req: Request, res: Response) => {
	req.logout()
}
