import { expect, test } from "@playwright/test";

test("renders reset password page", async ({ page }) => {
  await page.goto("/reset-password?token=sample-token");

  await expect(
    page.getByRole("heading", { name: "Reset password" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue password reset" })
  ).toBeVisible();
});

test("shows a missing token error before calling reset confirmation", async ({
  page,
}) => {
  await page.goto("/reset-password");
  await page.getByRole("button", { name: "Continue password reset" }).click();

  await expect(page.getByText("Reset token is missing.")).toBeVisible();
});
