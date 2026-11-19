import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { Activity, Team, User, Workout } from '../src/models/index.js';

let mongo: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 60_000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([Activity.deleteMany({}), Team.deleteMany({}), User.deleteMany({}), Workout.deleteMany({})]);
});

describe('Comportamento adicional da API', () => {
  it('rejeita duração inválida e integrantes inexistentes sem gravar registros', async () => {
    const team = await Team.create({ name: 'Octocats', mascot: 'Mona' });
    const user = await User.create({ name: 'Mona', email: 'mona@example.com', fitnessGoal: 'endurance' });
    for (const minutes of [0, -1, '30']) {
      const response = await request(app).post('/api/activities').send({
        userId: user._id.toString(), teamId: team._id.toString(), type: 'run', minutes,
      });
      expect(response.status).toBe(400);
    }
    const response = await request(app).post('/api/teams').send({
      name: 'Outra equipe', mascot: 'Mona', members: [new mongoose.Types.ObjectId().toString()],
    });
    expect(response.status).toBe(400);
    expect(await Activity.countDocuments()).toBe(0);
    expect(await Team.countDocuments()).toBe(1);
  });

  it('inclui equipes sem pontos e usa a atividade recente quando não há treino para a meta', async () => {
    const team = await Team.create({ name: 'Octocats', mascot: 'Mona' });
    const user = await User.create({ name: 'Mona', email: 'mona@example.com', fitnessGoal: 'mobility' });
    await Team.create({ name: 'Robocats', mascot: 'Hubot' });
    await Activity.create({ user: user._id, team: team._id, type: 'run', minutes: 10, points: 10, occurredAt: new Date() });
    await Workout.create({ title: 'Intervalos', focus: 'endurance', minutes: 30, difficulty: 'moderate' });

    const leaderboard = await request(app).get('/api/leaderboard');
    expect(leaderboard.body.leaderboard).toEqual([
      { teamName: 'Octocats', totalPoints: 10, rank: 1 },
      { teamName: 'Robocats', totalPoints: 0, rank: 2 },
    ]);
    const response = await request(app).get('/api/workouts/suggestions/mona%40example.com');
    expect(response.body.suggestions[0]).toMatchObject({ title: 'Intervalos', reason: expect.stringMatching(/atividade recente/i) });
  });
});
