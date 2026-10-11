import json,sys
d=json.loads(sys.argv[1]); print(json.dumps({"suma":sum(d["xs"]),"modelo":"python"}))
