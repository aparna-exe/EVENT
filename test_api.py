import requests

# Test the signup route
url = "http://127.0.0.1:5000/signup"
data = {
    "username": "MeghaTest",
    "email": "test@example.com",
    "password": "password123",
    "role": "participant"
}

response = requests.post(url, data=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")