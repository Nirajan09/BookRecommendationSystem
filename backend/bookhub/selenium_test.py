from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

driver = webdriver.Edge()

driver.get("http://localhost:5173/login")

# wait for username input
username = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.NAME, "username"))
)
password = driver.find_element(By.NAME, "password")

# fill values
username.send_keys("nirajantiwari28921")   
password.send_keys("nirajantiwari")

# click login button
login_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
login_btn.click()


# wait for redirect
WebDriverWait(driver, 10).until(
    EC.url_contains("/books")
)
time.sleep(10)

if "/books" in driver.current_url or "/admin" in driver.current_url:
    print("✅ Login Successful")
else:
    print("❌ Login Failed")
