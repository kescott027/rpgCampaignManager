from playwright.sync_api import sync_playwright


class HeadlessBrowser:
    def __init__():
        self.browser = p.chromium.launch(headless=True)

def load_page(self, url):

    with sync_playwright() as p:
        browser = self.browser
        page = browser.new_page()
        page.goto(url)


