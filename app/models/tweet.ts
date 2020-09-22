import mongoose from 'mongoose'

import { UserDocument } from './user'

const Schema = mongoose.Schema

export type TweetDocument = mongoose.Document & {
	author: UserDocument
	body: string
	favorites: UserDocument[]
	comments: TweetComment[]
}

interface TweetComment {
	id?: string
	body: string
	author: UserDocument
	favorites: UserDocument[]
	createdAt: Date
}

const tweetSchema = new Schema(
	{
		body: {
			type: String,
			default: '',
			trim: true,
			maxlength: 280,
			required: true,
		},
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		comments: [
			{
				body: { type: String, default: '', maxlength: 280, required: true },
				author: { type: Schema.Types.ObjectId, ref: 'User' },
				favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
)

export const Tweet = mongoose.model<TweetDocument>('Tweet', tweetSchema)
