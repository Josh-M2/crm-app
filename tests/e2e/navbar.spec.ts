import { expect, test } from "@playwright/test";

test("landing navbar has a comfortable desktop height", async ({ page }) => {
  await page.goto("/");
  await expect.poll(async () => (await page.locator("nav").first().boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(68);
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
});
