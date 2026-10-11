import http.server,base64,json,sys
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(s):
        auth=s.headers.get('Authorization','')
        if s.path.startswith('/api/v1/'):
            if auth!='Basic '+base64.b64encode(b'mario:k123').decode(): s.send_response(401); s.end_headers(); return
            if s.path.startswith('/api/v1/datasets/list'):
                b=json.dumps([{"ref":"demo/ventas","title":"Ventas demo","totalBytes":123,"voteCount":5}]).encode(); s.send_response(200); s.send_header('Content-Type','application/json'); s.end_headers(); s.wfile.write(b); return
            if s.path.startswith('/api/v1/datasets/download/demo/ventas'):
                s.send_response(302); s.send_header('Location','/storage/ds.zip'); s.end_headers(); return
        if s.path=='/storage/ds.zip':
            b=open('ds.zip','rb').read(); s.send_response(200); s.send_header('Content-Type','application/zip'); s.end_headers(); s.wfile.write(b); return
        if s.path=='/files/clientes.csv':
            s.send_response(200); s.end_headers(); s.wfile.write(b'id,nombre\n1,Ana\n2,Luis\n'); return
        s.send_response(404); s.end_headers()
    def log_message(s,*a): pass
import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
http.server.HTTPServer(('127.0.0.1',8799),H).serve_forever()
