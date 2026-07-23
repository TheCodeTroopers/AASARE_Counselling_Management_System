import { mockCases, mockDrafts } from './mock-data';

export async function createCase(payload: unknown) {
  return { success: true, message: 'Case created', data: { id: 'CASE-1001', payload } };
}

export async function updateCase(id: string, payload: unknown) {
  return { success: true, message: `Case ${id} updated`, data: { id, payload } };
}

export async function saveDraft(payload: unknown) {
  return { success: true, message: 'Draft saved', data: { id: 'DRAFT-001', payload } };
}

export async function getCase(id: string) {
  return { success: true, message: 'Case details loaded', data: mockCases.find((item) => item.id === id) ?? mockCases[0] };
}

export async function getAllCases() {
  return { success: true, message: 'Cases loaded', data: mockCases };
}

export async function getDrafts() {
  return { success: true, message: 'Draft list loaded', data: mockDrafts };
}
