import { client } from '../api/client';

const BASE = '/media';

export async function getAll() {
  const { data } = await client.get(BASE);
  return data;
}

export async function getById(id) {
  const { data } = await client.get(`${BASE}/${id}`);
  return data;
}

export async function create(payload) {
  const { data } = await client.post(BASE, payload);
  return data;
}

export async function update(id, payload) {
  const { data } = await client.put(`${BASE}/${id}`, payload);
  return data;
}

export async function remove(id) {
  await client.delete(`${BASE}/${id}`);
}
