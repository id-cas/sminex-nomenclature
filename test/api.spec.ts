import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { uploadCsv } from '../src/utils/uploader';
import app from '../src/index';	// Import main APP (Express)
import { Nomenclature } from '../src/database/models/nomenclature';

chai.use(chaiHttp);

let token: string;

describe('Authentication', () => {

	describe('POST /auth/login', () => {
		it('should return a token on successful login', (done) => {
			chai
				.request(app)
				.post('/auth/login')
				.send({ username: 'testuser', password: 'testpassword' }) // Must be other username/password for Prod
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					expect(res.body).to.have.property('token');
					token = res.body.token;
					done();
				});
		});

		it('should return a 401 status on failed login', (done) => {
			chai
				.request(app)
				.post('/auth/login')
				.send({ username: 'wronguser', password: 'wrongpassword' })
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(401);
					done();
				});
		});
	});

	describe('Protected Route', () => {
		it('should return a 401 status if no token is provided', (done) => {
			chai
				.request(app)
				.get('/api/nomenclature')
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(401);
					done();
				});
		});

		it('should return a 401 status if an invalid token is provided', (done) => {
			chai
				.request(app)
				.get('/api/nomenclature')
				.set('Authorization', 'Bearer invalid token')
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(401);
					done();
				});
		});

		it('should return a 200 status if a valid token is provided', (done) => {
			chai
				.request(app)
				.get('/api/nomenclature')
				.set('Authorization', `Bearer ${token}`)
				.end((err, res) => {
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					done();
				});
		});
	});

});


describe('Clear database table before API tests', () => {
	it('cleaning', async () => {
		await Nomenclature.destroy({ where: {}, truncate: true });
	});
});

describe('Upload database test data', () => {
	it('uploading', async () => {
		const rowsCount = await uploadCsv('./uploads/test.csv', false);
		expect(rowsCount).to.equal(15);
	});
});

describe('API Tests', () => {
	describe('GET /api/nomenclature', () => {
		it('should return a list of nomenclature', async () => {
			const res = await chai.request(app).get('/api/nomenclature').set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.be.greaterThan(0);
			expect(res.body.length).to.be.equal(14);

			for(let nomenclature of res.body){
				expect(nomenclature).to.have.property('code');
				expect(nomenclature).to.have.property('description');
				expect(nomenclature).to.have.property('level');
				expect(nomenclature).to.have.property('path');
			}
		});

		it('should return nomenclature single code specification', async () => {
			const code = 'A1010110';
			const res = await chai.request(app).get(`/api/nomenclature?code=${code}`).set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
			expect(res.body.length).to.equal(1);
			expect(res.body[0].path.length).to.equal(res.body[0].level);
		});

		it('should return nomenclature filtered by parent_code', async () => {
			const parentCode = 'A';
			const res = await chai.request(app).get(`/api/nomenclature?parent_code=${parentCode}`).set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');

			for (let nomenclature of res.body) {
				expect(nomenclature.path).to.include(parentCode);
				expect(nomenclature.path.length).to.equal(nomenclature.level);
			}
		});

		it('parents of A1010100 order must be correct order [A, A10, A1010, A1010100] ', async () => {
			const code = 'A1010100';
			const res = await chai.request(app).get(`/api/nomenclature?code=${code}`).set('Authorization', `Bearer ${token}`);
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');

			const expectArr = ['A', 'A10', 'A1010', 'A1010100'];
			expect(res.body[0].path.toString()).to.equal(expectArr.toString());
		});
	});

});

describe('Clear database table after API tests', () => {
	it('cleaning', async () => {
		await Nomenclature.destroy({ where: {}, truncate: true });
	});
});