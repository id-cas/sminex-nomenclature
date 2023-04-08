import express from 'express';
const { Op } = require("sequelize");
import { Nomenclature } from '../database/models/nomenclature';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const queryOptions: any = {
			attributes: ['code', 'level', 'description', 'path']
		};

		const parentCode = req?.query?.parent_code;
		if (parentCode) {
			queryOptions.where = {
				path: {[Op.regexp]: `"${parentCode}"`},
			};
		}

		const code = req?.query?.code;
		if (code) {
			queryOptions.where = {
				code: code,
			};
		}

		const nomenclatures = await Nomenclature.findAll(queryOptions);

		res.json(nomenclatures.map(item => {
			return {
				code: item?.code,
				level: item?.level,
				description: item?.description,
				path: JSON.parse(item?.path)
			}
		}));

	} catch (error) {
		res.status(500).json({ message: 'Error getting nomenclature items.', error });
	}
});

export default router;