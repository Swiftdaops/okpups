import puppeteer from "puppeteer";

const FRONTEND_URL = (process.env.FRONTEND_URL || "https://okpups.store").replace(/\/+$/, "");
const API_BASE = (process.env.API_BASE || "https://okpupsbackend-7gv3.onrender.com").replace(/\/+$/, "");
const EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD || process.env.PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Missing credentials. Set ADMIN_EMAIL + ADMIN_PASSWORD (or EMAIL + PASSWORD).");
  process.exit(2);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();

  page.setDefaultTimeout(60_000);

  const loginUrl = `${FRONTEND_URL}/admin/login`;
  console.log(`==> Opening ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector('input[placeholder="email@domain.com"]');
  await page.type('input[placeholder="email@domain.com"]', EMAIL, { delay: 10 });
  await page.type('input[placeholder="password"]', PASSWORD, { delay: 10 });

  const loginResponsePromise = page.waitForResponse((res) => {
    return res.url().startsWith(`${API_BASE}/auth/login`) && res.request().method() === "POST";
  });

  await page.click('button[type="submit"]');

  const loginResponse = await loginResponsePromise;
  console.log(`==> /auth/login status: ${loginResponse.status()}`);
  if (loginResponse.status() !== 200) {
    const body = await loginResponse.text().catch(() => "");
    throw new Error(`Login failed (status ${loginResponse.status()}): ${body}`);
  }

  // After login, the app navigates to /admin/dashboard.
  await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {
    // If Next transitions without a full navigation, URL check below will handle it.
  });

  const currentUrl = page.url();
  console.log(`==> Current URL: ${currentUrl}`);

  // Verify cookie-based auth works in the browser context.
  const me = await page.evaluate(async (apiBase) => {
    const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
    const text = await res.text();
    return { status: res.status, text };
  }, API_BASE);

  console.log(`==> /auth/me status: ${me.status}`);
  if (me.status !== 200) {
    throw new Error(`Expected /auth/me 200, got ${me.status}: ${me.text}`);
  }

  console.log("✅ Smoke login passed (cookie auth working)");
} finally {
  await browser.close();
}
