/**
 * Full-flow Playwright test for Actor Coach PWA.
 * Mocks camera, MediaRecorder, and API calls.
 * Tests: access → spin → first take → feedback → coached retry → comparison → new roulette
 */

import { test, expect } from '@playwright/test';

test.describe('Full Actor Coach Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock camera API
    await page.context().grantPermissions(['camera', 'microphone']);

    await page.addInitScript(() => {
      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 480;
        const stream = canvas.captureStream(30);
        const audioTrack = new MediaStreamTrackGenerator('audio');
        // @ts-ignore
        stream.addTrack(audioTrack);
        return stream;
      };

      // Mock MediaRecorder
      // @ts-ignore
      globalThis.MediaRecorder = class {
        state = 'inactive';
        ondataavailable: ((e: BlobEvent) => void) | null = null;
        onstop: (() => void) | null = null;
        constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {}
        start() {
          this.state = 'recording';
        }
        stop() {
          this.state = 'inactive';
          this.onstop?.();
        }
      };
    });

    // Mock API responses
    await page.route('**/api/access', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { granted: true } }),
      });
    });

    await page.route('**/api/pool', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            poolId: 'test-pool-1',
            lines: [
              "I accidentally married a penguin last night",
              "My left shoe is filing a restraining order",
              "I was raised by very confused wolves",
              "The toaster told me I have no future",
              "I am the emperor of this potato farm",
              "My reflection blinked out of sync",
              "A squirrel is my life coach now",
              "I sat on my own birthday cake again",
            ],
            emotions: ['delighted', 'furious', 'terrified', 'smug', 'heartbroken', 'suspicious', 'embarrassed'],
            expiresAt: Date.now() + 1200000,
          },
        }),
      });
    });

    await page.route('**/api/exercise', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              id: 'ex-test-123',
              line: 'I accidentally married a penguin last night',
              emotion: 'delighted',
              attempt: 1,
            },
          }),
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: {} }) });
      }
    });
  });

  test('complete two-take flow', async ({ page }) => {
    await page.goto('/');

    // Screen 0: Access — check age + consent, no access code needed
    await expect(page.getByText(/18 years/i)).toBeVisible();
    await expect(page.getByText(/consent/i)).toBeVisible();
    await page.getByText(/18 years/i).click();
    await page.getByText(/consent/i).click();
    await page.getByText(/Enter the Stage/i).click();

    // Should navigate to roulette
    await expect(page).toHaveURL(/\/roulette/, { timeout: 10000 });

    // Screen 1: Roulette
    await expect(page.getByText(/Scene Roulette/i)).toBeVisible();
    await expect(page.getByText(/Tap to spin/i)).toBeVisible();
    await page.getByText(/Spin the scene/i).click();

    // After spin animation, should see Start take
    await expect(page.getByText(/Start take/i)).toBeVisible({ timeout: 5000 });

    // Mock analysis response for attempt 1
    await page.route('**/api/analyze', async (route) => {
      const body = JSON.stringify({
        success: true,
        data: {
          feedback: {
            scores: { emotion: 4, clarity: 3, pace: 4 },
            strength: 'Great emotional range in your delivery.',
            retryCue: 'Try varying your tempo to better express "delighted".',
          },
        },
      });
      await route.fulfill({ status: 200, body });
    });

    await page.getByText(/Start take/i).click();

    // Screen 2: Record (will navigate away from roulette)
    await page.waitForTimeout(500);

    // Screen 3: Feedback (first take)
    await expect(page.getByText(/Take 1 Feedback/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Strength/i)).toBeVisible();
    await expect(page.getByText(/Retry cue/i)).toBeVisible();
    await expect(page.getByText(/Coached Retry/i)).toBeVisible();

    // Click retry
    await page.getByText(/Coached Retry/i).click();

    // Mock analysis for attempt 2 (with comparison)
    await page.route('**/api/analyze', async (route) => {
      const body = JSON.stringify({
        success: true,
        data: {
          feedback: {
            scores: { emotion: 5, clarity: 4, pace: 4 },
            strength: 'Excellent improvement in emotional connection.',
            retryCue: 'Consider a softer approach to the opening.',
          },
          comparison: {
            deltas: { emotion: 1, clarity: 1, pace: 0 },
          },
        },
      });
      await route.fulfill({ status: 200, body });
    });

    // Screen 2 again (retry record)
    await page.waitForTimeout(500);

    // Screen 3: Final feedback with comparison
    await expect(page.getByText(/Final Feedback/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/\+1/i)).toBeVisible(); // Score delta
    await expect(page.getByText(/Spin a new scene/i)).toBeVisible();

    // Click new scene
    await page.getByText(/Spin a new scene/i).click();
    await expect(page).toHaveURL(/\/roulette/);
  });

  test('requires age confirmation and consent', async ({ page }) => {
    await page.goto('/');

    // Try to enter without checking consent
    await page.getByText(/18 years/i).click();
    await page.getByText(/Enter the Stage/i).click();
    await expect(page.getByText(/consent to video processing/i)).toBeVisible();

    // Now check consent but uncheck age
    await page.getByText(/consent/i).click();
    await page.getByText(/18 years/i).click(); // uncheck
    await page.getByText(/Enter the Stage/i).click();
    await expect(page.getByText(/18 or older/i)).toBeVisible();
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto('/roulette');
    await expect(page).toHaveURL('/');
  });
});
