import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function invalid(message: string): never {
  throw Object.assign(new Error(message), { status: 400 });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

function isIdArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isId);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input) || !isId(input.userId) || !isId(input.teamId) ||
      typeof input.type !== 'string' || !input.type.trim() ||
      typeof input.minutes !== 'number' || !Number.isFinite(input.minutes) || input.minutes < 1) {
    invalid('Informe pessoa, equipe, tipo e minutos válidos para a atividade.');
  }
  const [user, team] = await Promise.all([User.exists({ _id: input.userId }), Team.exists({ _id: input.teamId })]);
  if (!user || !team) invalid('Pessoa ou equipe não encontrada.');
  return Activity.create({
    user: input.userId, team: input.teamId, type: input.type.trim(),
    minutes: input.minutes, points: input.minutes, occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim() ||
      typeof input.mascot !== 'string' || !input.mascot.trim() ||
      (input.members !== undefined && !isIdArray(input.members))) {
    invalid('Informe nome, mascote e integrantes válidos para a equipe.');
  }
  const members = input.members ?? [];
  const uniqueMembers = [...new Set(members.map((id) => id.toLowerCase()))];
  if (await User.countDocuments({ _id: { $in: uniqueMembers } }) !== uniqueMembers.length) {
    invalid('Um ou mais integrantes não foram encontrados.');
  }
  return Team.create({ name: input.name.trim(), mascot: input.mascot.trim(), members: uniqueMembers });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName, 'pt-BR'))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw Object.assign(new Error('Pessoa não encontrada.'), { status: 404 });

  const recent = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = { run: 'endurance', cycle: 'endurance', walk: 'endurance', strength: 'strength' };
  const recentFocus = recent ? activityFocus[recent.type] ?? recent.type : undefined;
  let workouts = await Workout.find({ focus: user.fitnessGoal }).lean();
  let reason = 'Recomendado para sua meta de atividade física.';
  if (workouts.length === 0 && recentFocus && recentFocus !== user.fitnessGoal) {
    workouts = await Workout.find({ focus: recentFocus }).lean();
    reason = 'Recomendado com base na sua atividade recente.';
  }
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
