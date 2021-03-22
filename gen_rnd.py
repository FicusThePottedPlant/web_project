from random import randint
a = randint(1, 26570)
print(a)
data = open('worldcities.csv', encoding='utf-8').readlines()[a]
print(data.split(',')[2:4])
