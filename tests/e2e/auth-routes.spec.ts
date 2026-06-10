import { expect, test } from "@playwright/test";

test("redirects protected routes to login when unauthenticated", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/);
});

test("renders login page", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Login to LeadNest" })
  ).toBeVisible();
});
