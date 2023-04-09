import {Nomenclature} from "../database/models/nomenclature";
import { parse } from 'csv-parse';

const fs = require('fs');


export const uploadCsv = async (filePath: string, unlink: boolean = false) => {
	return new Promise((resolve, reject) => {
		try {
			let lineNum = 0;
			const parentsMap = new Map<number, string>();
			parentsMap.set(0, null);	// root of everything

			const stream = fs.createReadStream(filePath, 'utf8').pipe(parse({delimiter: ';'}));
			stream.on('data', async (row) => {
				if(lineNum === 0){
					lineNum++;
					return false;
				}
				lineNum++;

				if(row.length < 3){
					console.error(`Wrong data length in CSV line ${lineNum}`, row);
					return false;
				}

				const code: string = row[0].toString();
				const description: string = row[1].toString();
				const level: number = parseInt(row[2].toString());

				parentsMap.set(level, code);
				let parentCode = parentsMap.get(level - 1);

				const pathArr = [];
				for(let i = 1; i <= level; i++){
					pathArr.push(parentsMap.get(i));
				}

				let mysqlData = {
					code: code,
					parentCode: parentCode,
					path: JSON.stringify(pathArr),
					level: level,
					description: description,
				};

				stream.pause();
				Nomenclature.create(mysqlData)
					.then(() => {
						stream.resume();
					})
					.catch(e => {
						console.warn(e);
					})
			});

			stream.on('error', (e) => {
				console.error('Error createReadStream', e);
			});

			stream.on('end', () => {
				resolve(lineNum);
			});

		} catch (error) {
			reject(error);
		} finally {
			if(unlink === true) {
				fs.unlinkSync(filePath);
			}
		}
	});
}