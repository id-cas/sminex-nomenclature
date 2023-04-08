import bcrypt from 'bcrypt';

interface User {
	username: string;
	password: string;
}

// Замените значения на реальные данные пользователя
const users: User[] = [
	{
		username: 'testuser',
		password: '$2b$10$4ng.A0Pz.trMQDDLTykOruDtp7mTUInoKUrKdGOVihcMBJ7kV1b7u' // hashed password for 'testpassword'
	}
];

export const findUser = (username: string) => {
	return users.find((user) => user.username === username);
};

export const checkPassword = async (password: string, hashedPassword: string) => {
	return await bcrypt.compare(password, hashedPassword);
};