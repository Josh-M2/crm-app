import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("landing navigation works on a narrow screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Every lead deserves a next step." })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect.poll(async () => (await page.locator("nav").first().boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(68);

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("link", { name: "Contact Us" }).first()).toBeVisible();
});
