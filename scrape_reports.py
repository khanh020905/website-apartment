from playwright.sync_api import sync_playwright
import time
import os

def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        
        print("1. Opening login page...")
        page.goto("https://tra-my.smartos.space/pms/login")
        
        try:
            page.wait_for_load_state('networkidle')
        except:
            pass

        time.sleep(2)
        print("2. Filling login details...")
        page.fill("#email", "nguyenvinhthitramy881@gmail.com")
        page.fill("#password", "lcrdd(o7k")
        
        page.click("button.submit-btn, button[type='submit']")
        
        print("3. Waiting for authentication...")
        try:
            page.wait_for_url("**/pms/**", timeout=20000)
            page.wait_for_load_state('networkidle')
        except Exception as e:
            print("Login timeout or error (might have succeeded though):", e)
        time.sleep(5)
        
        print("4. Login successful, scraping reports...")

        danh_sach_url = [
            ("https://tra-my.smartos.space/pms/businessInformation", "management_BusinessInfo")
        ]
        
        thu_muc_luu = "scraped_ui"
        os.makedirs(thu_muc_luu, exist_ok=True)
        
        for url, name in danh_sach_url:
            print(f" -> Fetching {name}")
            page.goto(url)
            
            try:
                page.wait_for_load_state('networkidle', timeout=15000)
            except:
                pass
                
            time.sleep(10)
            
            # --- Tắt modal quảng cáo ---
            try:
                # Cách 1: Thử bấm phím ESC để đóng modal
                page.keyboard.press("Escape")
                time.sleep(1)
                
                # Cách 2: Nếu modal vẫn còn, tìm nút X để bấm (Dựa trên class ant-modal của Ant Design)
                close_btn = page.locator(".ant-modal-close, .close-icon, svg[data-icon='close']")
                if close_btn.count() > 0 and close_btn.first.is_visible():
                    close_btn.first.click()
            except Exception as e:
                pass
                
            time.sleep(2) # Đợi hiệu ứng đóng modal
            
            html = page.content()
            html_path = os.path.join(thu_muc_luu, f"{name}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html)
            
            png_path = os.path.join(thu_muc_luu, f"{name}.png")
            page.screenshot(path=png_path, full_page=True)
            
            print(f"   + Saved file: {name}.png and {name}.html")
            
        browser.close()
        print(f"All Done! Data saved in '{thu_muc_luu}'")

if __name__ == "__main__":
    scrape()
