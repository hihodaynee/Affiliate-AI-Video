import { vi } from 'vitest';
export const Flow = {
  upload: vi.fn(), download: vi.fn(),
  media: { select: vi.fn() },
  generate: { text: vi.fn(), image: vi.fn(), video: vi.fn() },
};
