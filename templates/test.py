import random

data = {i: [] for i in range(100)}
for i in range(100):
    a = random.randint(0, 1000)
    data[a // 10].append(a)
for i, j in data.items():
    if j:
        print(i, j)
