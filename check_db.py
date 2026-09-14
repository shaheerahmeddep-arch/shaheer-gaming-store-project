import sqlite3, os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'db.sqlite3')
print('DB exists?', os.path.exists(db_path))
print('DB size:', os.path.getsize(db_path) if os.path.exists(db_path) else 'N/A')

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [t[0] for t in c.fetchall()]
print('\n=== TABLES (count = %d) ===' % len(tables))
for t in tables:
    print(' ', t)

if 'products_product' in tables:
    c.execute('SELECT COUNT(*) FROM products_product')
    count = c.fetchone()[0]
    print('\n=== PRODUCT COUNT:', count, '===')
    if count > 0:
        c.execute('SELECT id, name, category, brand, image FROM products_product')
        for row in c.fetchall():
            print(' ', row)
else:
    print('\nNO products_product TABLE - migrations not applied!')

if 'django_migrations' in tables:
    print('\n=== MIGRATIONS APPLIED ===')
    c.execute('SELECT app, name FROM django_migrations ORDER BY applied')
    for row in c.fetchall():
        print(' ', row)
else:
    print('\nNO django_migrations TABLE!')

conn.close()
