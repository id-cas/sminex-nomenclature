import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

export class Nomenclature extends Model {
	public code!: string;
	public parentCode!: string | null;
	public level!: number;
	public path!: string | null;
	public description!: string;
}

Nomenclature.init(
	{
		code: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		parentCode: {
			type: DataTypes.STRING,
			allowNull: true,
			references: {
				model: Nomenclature,
				key: 'code',
			},
		},
		level: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
		},
		path: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'nomenclatures',
		sequelize,
	}
);
//
// Nomenclature.hasMany(Nomenclature, { as: 'children', foreignKey: 'parentCode' });
// Nomenclature.belongsTo(Nomenclature, { as: 'parent', foreignKey: 'parentCode' });
