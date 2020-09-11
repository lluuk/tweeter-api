import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'

const Schema = mongoose.Schema;

export type UserDocument = mongoose.Document & {
	email: string
	password: string
	name: string
	passwordResetToken: string
	passwordResetExpires: Date

	facebook: string
	tokens: AuthToken[]
	followers: UserDocument[]
	following: UserDocument[]
	avatar: Buffer

	comparePassword: comparePasswordFunction
}

type comparePasswordFunction = (
	candidatePassword: string,
	cb: (err: any, isMatch: any) => {}
) => void

export interface AuthToken {
	accessToken: string
	kind: string
}

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value: string): any {
				if (!validator.isEmail(value)) {
					throw new Error('Email must be correct email')
				}
			},
		},

		name: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 7,
			trim: true,
			validate(value: string): any {
				if (value.toLowerCase().includes('password')) {
					throw new Error('Password cannot contains "password"')
				}
			},
		},
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		avatar: {
			type: Buffer,
		},
		tokens: Array,
	},
	{ timestamps: true }
)

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const user = this as UserDocument
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

const comparePassword: comparePasswordFunction = function (this: any, 
	candidatePassword,
	cb
) {
	const user = this as UserDocument
	bcrypt.compare(
		candidatePassword,
		user.password,
		(err: mongoose.Error, isMatch: boolean) => {
			cb(err, isMatch)
		}
	)
}

userSchema.methods.comparePassword = comparePassword

export const User = mongoose.model<UserDocument>('User', userSchema)
