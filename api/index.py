import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('DJANGO_FORCE_SCRIPT_NAME', '')

from django.core.wsgi import get_wsgi_application

_application = get_wsgi_application()


def _normalize_path(environ):
    """Ensure Django sees the full request path so URL patterns match.

    Vercel routes '/api/products/...' to this handler at /api/index.py,
    but sometimes strips the /api prefix from PATH_INFO.  Reconstruct
    the path from whatever information is available so the router in
    config/urls.py (which expects /api/..., /admin/..., /media/...)
    always matches correctly.
    """
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
    _normalize_path(environ)
    try:
        return _application(environ, start_response)
    except Exception:
        import traceback
        try:
            traceback.print_exc()
            status = '500 Internal Server Error'
            response_headers = [('Content-Type', 'text/plain; charset=utf-8')]
            start_response(status, response_headers)
            return [b'Server Error - Django application could not handle the request']
        except Exception:
            raise


# Support both WSGI-style names some runtimes expect
application = app
handler = app
