import requests
import time
proxy = 'socks5://t17238442689768:v495f71y@t107.kdltps.com:20818'
PROXIES = {'http': proxy, 'https': proxy}

# url = 'https://myip.ipip.net'
url = 'https://ifconfig.me'
session = requests.session()

t1 = time.time()
n = 0
for i in range(5):
    r = None
    try:
        r = requests.get(url, timeout=1, proxies=PROXIES)
    except:
        n += 1
        continue
    if r.status_code != 200:
        n += 1
    print(r.content)
print(time.time() - t1)
print('errors', n)
print(r.content)