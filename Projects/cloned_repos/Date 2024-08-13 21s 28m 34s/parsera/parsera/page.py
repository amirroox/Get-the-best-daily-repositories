from playwright.async_api import async_playwright
from playwright_stealth import stealth_async


async def fetch_page_content(url: str) -> str:
    async with async_playwright() as p:
        # Launch the browser
        browser = await p.chromium.launch(headless=True)
        # Open a new browser context
        context = await browser.new_context()
        # Open a new page
        page = await context.new_page()
        await stealth_async(page)

        # Navigate to the URL
        # await page.route("**/*.{png,jpg,jpeg}", lambda route: route.abort()) # Can speed up requests
        await page.goto(url)

        # Wait for the content to be dynamically loaded
        await page.wait_for_load_state("domcontentloaded")
        # Get the page content
        content = await page.content()

        # Close the browser
        await browser.close()

        return content
