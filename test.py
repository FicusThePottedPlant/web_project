import requests

print(requests.post('http://127.0.0.1:5000/api/users/', json={'email': 'sobaka', 'password': 'dudos355'}).json())
