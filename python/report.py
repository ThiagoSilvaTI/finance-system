import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

conn = sqlite3.connect('../backend/database.db')

df = pd.read_sql_query("SELECT * FROM transactions", conn)

resumo = df.groupby('type')['amount'].sum()

print(resumo)

resumo.plot(kind='bar', title="Resumo Financeiro")
plt.show()