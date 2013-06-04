import sqlite3

conn  = sqlite3.connect("hgtdb.db")
c = conn.cursor()
print c.execute("SELECT * from restaurants").fetchall()
conn.close()