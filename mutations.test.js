const request = require('supertest');
const app = require('./index');
const { storeMutation, getStats } = require('./db');

// Mock the storeMutation and getStats functions
jest.mock('./db', () => {
    return {
        storeMutation: jest.fn(),
        getStats: jest.fn(),
    };
});

describe('Mutation API', () => {
    describe('POST /mutation', () => {
        it('should return 200 OK if mutation exists', async () => {
            storeMutation.mockResolvedValue(true);

            const response = await request(app)
                .post('/mutation')
                .send({ dna: ["ATGCGA", "CAGTGC", "TTATGT", "AGAAGG", "CCCCTA", "TCACTG"] });

            expect(response.statusCode).toBe(200);
            expect(storeMutation).toHaveBeenCalledWith(
                ["ATGCGA", "CAGTGC", "TTATGT", "AGAAGG", "CCCCTA", "TCACTG"],
                true
            );
        });

        it('should return 403 Forbidden if mutation does not exist', async () => {
            storeMutation.mockResolvedValue(false);

            const response = await request(app)
                .post('/mutation')
                .send({ dna: ["ATTAGA", "CAGTGC", "TTATTT", "AGACGG", "GCGTCA", "TCACTG"] });

            expect(response.statusCode).toBe(403);
            expect(storeMutation).toHaveBeenCalledWith(
                ["ATTAGA", "CAGTGC", "TTATTT", "AGACGG", "GCGTCA", "TCACTG"],
                false
            );
        });

        it('should return 500 Internal Server Error if an error occurs', async () => {
            storeMutation.mockRejectedValue(new Error('DB error'));

            const response = await request(app)
                .post('/mutation')
                .send({ dna: ["ATGCGA", "CAGTGC", "TTATGT", "AGAAGG", "CCCCTA", "TCACTG"] });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: 'DB error' });
            expect(storeMutation).toHaveBeenCalledWith(
                ["ATGCGA", "CAGTGC", "TTATGT", "AGAAGG", "CCCCTA", "TCACTG"],
                true
            );
        });
    });

    describe('GET /stats', () => {
        it('should return 200 OK with correct stats', async () => {
            const mockStats = {
                count_mutations: 50,
                count_no_mutation: 100,
            };
            getStats.mockResolvedValue(mockStats);

            const response = await request(app).get('/stats');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                ...mockStats,
                ratio: 2,
            });
            expect(getStats).toHaveBeenCalled();
        });
        it('should return 500 Internal Server Error if an error occurs', async () => {
            getStats.mockRejectedValue(new Error('DB error'));

            const response = await request(app).get('/stats');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: 'DB error' });
            expect(getStats).toHaveBeenCalled();
        });
    });
});

