import jwt from 'jsonwebtoken';

const SECRET_KEY = 'M+AMwULI54pw&xVa-pV*RAsKKttdegcn!';

export const sign = (payload: any) => {
	return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

export const verify = (token: string) => {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (error) {
		return null;
	}
};