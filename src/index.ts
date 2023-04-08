import express, { Request, Response } from 'express';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('../swagger.json');

import { sign, verify } from './utils/auth';
import { findUser, checkPassword } from './utils/user';
import nomenclatureRouter from './routes/nomenclature';
import { uploadCsv } from './utils/uploader';
import { sequelize } from './database/database';


interface File {
	path: string;
}

interface MulterRequest extends Request {
	file: File;
}



const app = express();

/** UPLOAD CSV */
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), async (req: MulterRequest, res: Response) => {
	const file: File = req.file;
	if (!file) {
		res.status(400).send('No file uploaded');
		return;
	}

	try {
		await uploadCsv(file.path, true);
		res.status(200).send('CSV data successfully imported to DB.');
	} catch (error) {
		res.status(500).send('Error processing the file');
	}
});


/** Swagger API Docs */
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/auth/login', async (req, res) => {
	const { username, password } = req.body;

	const user = findUser(username);

	if (user && (await checkPassword(password, user.password))) {
		const token = sign({ username: user.username });

		res.json({ token });
	} else {
		res.status(401).json({ message: 'Invalid username or password' });
	}
});

const authMiddleware = (req: Request, res: Response, next: () => void) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: 'No token provided' });
	}

	const token = authHeader.split(' ')[1];
	const decoded = verify(token);

	if (decoded) {
		next();
	} else {
		res.status(401).json({ message: 'Invalid token' });
	}
};

app.use('/api/nomenclature', authMiddleware, nomenclatureRouter);


/** START **/
const PORT: string | number = process.env.PORT || 3000;
sequelize.sync({ force: false }).then((result) => {
	/** Serve after DB connected **/
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}).catch(err => {
	console.log(err);
});

export default app;