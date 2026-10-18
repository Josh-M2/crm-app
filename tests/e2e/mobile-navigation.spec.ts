import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768]) {
  test(`landing navigation works at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Primary" });
    const toggle = nav.getByRole("button", { name: "Open menu" });

    await expect(page.getByRole("heading", { name: "Every lead deserves a next step." })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(68);
    await expect(nav.getByRole("button", { name: "Features" })).toBeHidden();
    await expect(toggle).toBeVisible();

    await toggle.click();
    const mobileMenu = page.locator("#mobile-navigation");
    await expect(mobileMenu.getByRole("link", { name: "Contact Us" })).toBeVisible();
    await mobileMenu.getByRole("button", { name: "Features" }).click();
    await expect(mobileMenu).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    await expect(mobileMenu).toBeHidden();
  });
}
