import { deleteJson, getJson, postJson, putJson } from '@/shared/api/client';
import type { Playbook, PlaybookFilter } from '../types/playbook.types';

const STUDIO_BASE = '/api/studio/playbooks';

interface BackendPlaybookHandleDto {
  playbook_handle_id: string;
  title: string;
}

interface BackendPlaybookDraftDto {
  draft_id: string;
  playbook_handle_id: string;
  spec_document: string;
  validation_state: string;
}

interface BackendPlaybookVersionDto {
  playbook_version_id: string;
  playbook_handle_id: string;
  version_number: number;
}

interface BackendStudioPlaybookDto {
  handle: BackendPlaybookHandleDto;
  draft: BackendPlaybookDraftDto;
  latest_version: BackendPlaybookVersionDto | null;
  publishable: boolean;
}

interface BackendPlaybookDetailDto {
  handle: BackendPlaybookHandleDto;
  draft: BackendPlaybookDraftDto;
  versions: BackendPlaybookVersionDto[];
}

interface BackendCreatePlaybookRequest {
  title: string;
  description: string;
  mode: string;
}

interface BackendCreatePlaybookResponse {
  handle: BackendPlaybookHandleDto;
  draft: BackendPlaybookDraftDto;
}

interface BackendUpdatePlaybookRequest {
  title?: string;
  description?: string;
  mode?: string;
  tags?: string[];
}

interface BackendSaveDraftRequest {
  spec_document: string;
}

interface BackendPublishPlaybookResponse {
  version: BackendPlaybookVersionDto | null;
}

function extractMetadataField(specDocument: string, field: 'description' | 'mode' | 'title'): string {
  const match = specDocument.match(new RegExp(`^\\s*${field}:\\s*"?([^"\\n]+)"?`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function mapStatus(latestVersion: BackendPlaybookVersionDto | null): Playbook['status'] {
  return latestVersion ? 'published' : 'draft';
}

function toVersionLabel(latestVersion: BackendPlaybookVersionDto | null): string {
  return latestVersion ? `v${latestVersion.version_number}` : 'draft';
}

function toPlaybook(
  handle: BackendPlaybookHandleDto,
  draft: BackendPlaybookDraftDto,
  latestVersion: BackendPlaybookVersionDto | null,
  publishable: boolean,
): Playbook {
  const now = new Date().toISOString();
  const description = extractMetadataField(draft.spec_document, 'description');

  return {
    id: handle.playbook_handle_id,
    name: handle.title,
    description,
    version: toVersionLabel(latestVersion),
    status: mapStatus(latestVersion),
    createdAt: now,
    updatedAt: now,
    author: {
      id: 'current-user',
      name: 'Current User',
      email: 'current@example.com',
    },
    specDocument: draft.spec_document,
    publishable,
  };
}

function applyFilters(items: Playbook[], filters?: PlaybookFilter): Playbook[] {
  let filtered = [...items];

  if (filters?.status) {
    filtered = filtered.filter((playbook) => playbook.status === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (playbook) =>
        playbook.name.toLowerCase().includes(search) ||
        playbook.description.toLowerCase().includes(search) ||
        playbook.specDocument.toLowerCase().includes(search),
    );
  }

  if (filters?.sortBy) {
    filtered.sort((left, right) => {
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      const leftValue = left[filters.sortBy ?? 'updatedAt'];
      const rightValue = right[filters.sortBy ?? 'updatedAt'];
      return leftValue > rightValue ? order : -order;
    });
  }

  return filtered;
}

async function listPlaybooks(filters?: PlaybookFilter): Promise<Playbook[]> {
  const items = await getJson<BackendStudioPlaybookDto[]>(STUDIO_BASE);
  return applyFilters(
    items.map((item) => toPlaybook(item.handle, item.draft, item.latest_version, item.publishable)),
    filters,
  );
}

async function getPlaybook(id: string): Promise<Playbook> {
  const detail = await getJson<BackendPlaybookDetailDto>(`${STUDIO_BASE}/${id}`);
  const latestVersion = detail.versions[detail.versions.length - 1] ?? null;
  const publishable = detail.draft.validation_state === 'validated';
  return toPlaybook(detail.handle, detail.draft, latestVersion, publishable);
}

async function createPlaybook(data: Partial<Playbook>): Promise<Playbook> {
  const response = await postJson<BackendCreatePlaybookRequest, BackendCreatePlaybookResponse>(STUDIO_BASE, {
    title: (data.name ?? extractMetadataField(data.specDocument ?? '', 'title')) || 'New Playbook',
    description: data.description ?? extractMetadataField(data.specDocument ?? '', 'description'),
    mode: extractMetadataField(data.specDocument ?? '', 'mode') || 'standard',
  });

  if (data.specDocument && data.specDocument !== response.draft.spec_document) {
    return savePlaybookDraft(response.handle.playbook_handle_id, data.specDocument);
  }

  return toPlaybook(response.handle, response.draft, null, false);
}

async function updatePlaybook(id: string, data: Partial<Playbook>): Promise<Playbook> {
  const request: BackendUpdatePlaybookRequest = {};

  if (data.name) {
    request.title = data.name;
  }

  if (data.description) {
    request.description = data.description;
  }

  if (Object.keys(request).length > 0) {
    await putJson<BackendUpdatePlaybookRequest, { handle: BackendPlaybookHandleDto }>(`${STUDIO_BASE}/${id}`, request);
  }

  if (data.specDocument) {
    return savePlaybookDraft(id, data.specDocument);
  }

  return getPlaybook(id);
}

async function savePlaybookDraft(id: string, specDocument: string): Promise<Playbook> {
  await putJson<BackendSaveDraftRequest, { draft: BackendPlaybookDraftDto }>(`${STUDIO_BASE}/${id}/draft`, {
    spec_document: specDocument,
  });

  return getPlaybook(id);
}

async function deletePlaybook(id: string): Promise<void> {
  await deleteJson<void>(`${STUDIO_BASE}/${id}`);
}

async function publishPlaybook(id: string): Promise<Playbook> {
  await postJson<Record<string, never>, BackendPublishPlaybookResponse>(`${STUDIO_BASE}/${id}/publish`);
  return getPlaybook(id);
}

export const playbookApi = {
  listPlaybooks,
  getPlaybook,
  createPlaybook,
  updatePlaybook,
  savePlaybookDraft,
  deletePlaybook,
  publishPlaybook,
};
