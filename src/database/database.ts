import { Sequelize } from 'sequelize';

// Database connection
const DB_NAME = 'db_sminex';
const DB_USER = 'usr_sminex';
const DB_PASSWORD = '?r^WslLdEs!Cej';
const DB_HOST = '127.0.0.1';
const DB_PORT = 3306;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'mysql',
	logging: false, // TRUE if you want to see database query logs
	define: {
		freezeTableName: true,
		timestamps: false,
	},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

sequelize.authenticate()
	.then(() => {
		console.log('Database connection established successfully');
	})
	.catch((err: Error) => {
		console.error('Error connecting to database:', err);
	});
