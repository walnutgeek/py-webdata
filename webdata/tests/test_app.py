from __future__ import print_function
from nose.tools import eq_,with_setup

def test():
    from selenium import webdriver
    driver = webdriver.PhantomJS()
    driver.set_window_size(1120, 550)
    driver.get("http://127.0.0.1:7532/")
    driver.find_element_by_link_text("node_modules").click()
    driver.find_element_by_link_text("jquery").click()
    driver.find_element_by_link_text("README.md").click()
    driver.find_element_by_link_text("jquery").click()
    driver.find_element_by_link_text("AUTHORS.txt").click()
    print(driver.current_url)
    driver.quit()

