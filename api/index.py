import os
import sys
import traceback

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('DJANGO_FORCE_SCRIPT_NAME', '')


def _bootstrap_django():
    """Run migrations + seed + static setup exactly once on cold start.

    Returns True if Django is usable, False if a non-fatal setup error
    occurred (we still try to serve requests as best we can).
    """
    try:
        import django
        django.setup()
    except Exception:
        print('[api/index.py] django.setup() FAILED:')
        traceback.print_exc()
        return False

    try:
        from django.core.management import call_command
        # 1) Run any outstanding migrations.  --run-syncdb is safe even
        #    when migrations already exist, it fills in any tables that
        #    haven't been created yet (catches race on new deploys).
        try:
            call_command('migrate', '--no-input', verbosity=0)
        except Exception:
            print('[api/index.py] migrate failed (continuing):')
            traceback.print_exc()

        # 2) Seed sample products if the products table exists but is empty.
        try:
            from django.apps import apps
            try:
                Product = apps.get_model('products', 'Product')
                if Product._meta.db_table and Product.objects.count() == 0:
                    call_command('seed_products', verbosity=0)
            except Exception:
                # Either Product model isn't ready yet or seed_products is missing.
                # Not fatal for all endpoints, so log and continue.
                print('[api/index.py] product seed skipped (non-fatal):')
                traceback.print_exc()
        except Exception:
            print('[api/index.py] could not check/seed products:')
            traceback.print_exc()

        # 3) Ensure a default admin user exists ONLY if DJANGO_BOOTSTRAP_ADMIN is set.
        #    (We never create an admin silently in production to avoid security
        #    surprises; the user must opt in via env var.)
        bootstrap_admin = os.environ.get('DJANGO_BOOTSTRAP_ADMIN', '')
        if bootstrap_admin:
            try:
                User = apps.get_model('users', 'User')
                parts = [p for p in bootstrap_admin.split(':') if p]
                if len(parts) >= 2 and not User.objects.filter(is_superuser=True).exists():
                    username, password = parts[0], parts[1]
                    email = parts[2] if len(parts) >= 3 else (username + '@example.com')
                    User.objects.create_superuser(username=username, email=email, password=password)
                    print(f'[api/index.py] Created bootstrap superuser: {username}')
            except Exception:
                print('[api/index.py] bootstrap admin failed (non-fatal):')
                traceback.print_exc()

        return True
    except Exception:
        print('[api/index.py] bootstrap FAILED completely:')
        traceback.print_exc()
        return False


_bootstrap_done = False
_bootstrap_ok = False
from django.core.wsgi import get_wsgi_application
_application = None


def _ensure_bootstrapped():
    global _bootstrap_done, _bootstrap_ok, _application
    if not _bootstrap_done:
        _bootstrap_ok = _bootstrap_django()
        try:
            _application = get_wsgi_application()
        except Exception:
            print('[api/index.py] get_wsgi_application() FAILED:')
            traceback.print_exc()
            _application = None
        _bootstrap_done = True


def _normalize_path(environ):
    """Ensure Django sees the full request path so URL patterns match."""
    path_info = environ.get('PATH_INFO', '') or ''
    script_name = environ.get('SCRIPT_NAME', '') or ''
    original_uri = environ.get('REQUEST_URI', '') or environ.get('RAW_URI', '') or ''

    if original_uri:
        from urllib.parse import unquote
        path = unquote(original_uri.split('?', 1)[0])
        environ['PATH_INFO'] = path
        environ['SCRIPT_NAME'] = ''
        return

    candidate = path_info or script_name or ''
    for prefix in ('/api/', '/admin/', '/media/', '/static/'):
        if candidate.startswith(prefix) or candidate == prefix.rstrip('/'):
            environ['PATH_INFO'] = candidate
            environ['SCRIPT_NAME'] = ''
            return
        if path_info.startswith(prefix[1:]):
            environ['PATH_INFO'] = '/' + path_info.lstrip('/')
            environ['SCRIPT_NAME'] = ''
            return
        if path_info and path_info.lstrip('/') and not path_info.startswith('/'):
            environ['PATH_INFO'] = '/' + path_info
            environ['SCRIPT_NAME'] = ''
            return
    environ['PATH_INFO'] = path_info if path_info.startswith('/') else ('/' + path_info)
    environ['SCRIPT_NAME'] = ''


def app(environ, start_response):
    _ensure_bootstrapped()
    _normalize_path(environ)
    if _application is None:
        status = '500 Internal Server Error'
        response_headers = [('Content-Type', 'text/plain; charset=utf-8')]
        start_response(status, response_headers)
        return [b'Server Error - Django application failed to bootstrap on this serverless instance.  See function logs for details.']
    try:
        return _application(environ, start_response)
    except Exception:
        try:
            traceback.print_exc()
            status = '500 Internal Server Error'
            response_headers = [('Content-Type', 'text/plain; charset=utf-8')]
            start_response(status, response_headers)
            return [b'Server Error - Django application could not handle the request.  See function logs for details.']
        except Exception:
            raise


application = app
handler = app
