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
	res: Response
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
    res.send()
}

/**
 * Get my profile.
 * @route get /me
 */
export const getMe = (req: Request, res: Response) => {
    res.send(req.user)
}

/**
 * Get user profile.
 * @route get /user
 */
export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
}

/**
 * Get user profile.
 * @route post /follow
 */

export const addFollow = async (req: Request, res: Response) => {
    try {
        const myUser = req.user as UserDocument;
        const followUser = await User.findById(req.params.id)

        if (!followUser) {
            return res.status(404).send()
        }
        myUser.following.push(followUser)
        followUser.followers.push(myUser)
        await myUser.save()
        await followUser.save()
        res.send(followUser)
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Get user profile.
 * @route remove /follow
 */

export const removeFollow = async (req: Request, res: Response) => {
    try {
        const myUser = req.user as UserDocument;
        const followedUser = await User.findById(req.params.id)

        if (!followedUser) {
            return res.status(404).send()
        }
        myUser.following = myUser.following.filter(follow => follow.toString() !== followedUser.id)
        followedUser.followers = followedUser.followers.filter(follow => follow.toString() !== myUser.id)
        await myUser.save()
        await followedUser.save()
        res.send(followedUser)
    } catch (e) {
        res.status(500).send(e)
    }
}
