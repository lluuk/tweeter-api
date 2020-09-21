import { Request, Response } from 'express'

import { Tweet, TweetDocument } from '../models/tweet'
import { UserDocument } from '../models/user'

/**
 * Create a new tweet.
 * @route POST /tweet
 */
export const addTweet = async (
	req: Request,
	res: Response
) => {
    try {
        const tweet = new Tweet(req.body)
        const user = req.user as UserDocument;
        tweet.author = user
        await tweet.save()
        res.status(201).send({ tweet })
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Create a new tweet.
 * @route POST /tweet
 */
export const removeTweet = async (
	req: Request,
	res: Response
) => {
    try {
        const tweet = await Tweet.findOneAndDelete({
            _id: req.params.id
        })

        if (!tweet) {
            return res.status(404).send()
        }

        res.send(tweet)
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Get tweet
 * @route get /tweet
 */
export const getTweet = async (req: Request, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            return res.status(404).send()
        }
        res.send(tweet)
    } catch (e) {
        res.status(500).send()
    }
}

/**
 * Get tweets
 * @route get /tweets
 */
export const getTweets = async (req: Request, res: Response) => {
    try {
        const user = req.user as UserDocument;        
        const tweets = await Tweet.find({ author: { $in: user.following }})

        res.send(tweets)
    } catch (e) {
        res.status(500).send()
    }
}

/**
 * Get tweet tweets
 * @route update /tweet
 */
export const updateTweet = async (req: Request, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            return res.status(404).send()
        }
        tweet.body = req.body.body
        await tweet.save()
        res.send(tweet)
    } catch (e) {
        res.status(400).send(e.message)
    }
}
