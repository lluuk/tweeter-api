import { Request, Response } from 'express'

import { Tweet } from '../models/tweet'
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
 * Remove tweet.
 * @route DELETE /tweet
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
 * @route GET /tweet
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
 * @route GET /tweets
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
 * Update tweet
 * @route PATCH /tweet
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

/**
 * Create a new tweet's comment.
 * @route POST /tweet/comment
 */
export const addTweetComment = async (
	req: Request,
	res: Response
) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet) {
            return res.status(404).send()
        }

        const user = req.user as UserDocument
        const comment = {
            body: req.body.comment,
            author: user,
            favorites: [],
            createdAt: new Date
        }

        tweet.comments.push(comment)

        await tweet.save()
        res.status(201).send({ tweet })
    } catch (e) {
        res.status(400).send(e)
    }
}

/**
 * Remove tweet's comment.
 * @route DELETE /tweet/comment
 */
export const removeTweetComment = async (
	req: Request,
	res: Response
) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet || !tweet.comments) {
            return res.status(404).send()
        }

        tweet.comments = tweet?.comments.filter(comment => comment.id !== req.params.commentId)
        await tweet.save()

        res.send(tweet)
    } catch (e) {
        res.status(500).send(e)
    }
}

/**
 * Update tweet
 * @route PATCH /tweet
 */
export const updateTweetComment = async (req: Request, res: Response) => {
    try {
        const tweet = await Tweet.findById(req.params.id)

        if (!tweet || !tweet.comments) {
            return res.status(404).send()
        }
        const comment = tweet.comments.find(comment => comment.id === req.params.commentId)
        
        if (!comment) {
            return res.status(404).send()
        }

        comment.body = req.body.comment
        await tweet.save()
        res.send(tweet)
    } catch (e) {
        res.status(400).send(e.message)
    }
}
