import subprocess
import os
import signal
import time
import json

from flask import Flask, make_response, request
from flask_cors import CORS
app = Flask(__name__)   
cross = CORS(app, origins="*")

exercice = None
@app.route('/run',methods=["POST"])

def run_program():
    global exercice
    my_json = request.data.decode('utf8').replace("'", '"')
    data = json.loads(my_json)
    code = json.dumps(data["code"])
    print(code)

    # Stop process have alreay up
    if exercice:
        try:
            os.killpg(os.getpgid(exercice.pid), signal.SIGKILL)
        except ProcessLookupError:
            pass

    time.sleep(2)
    
    # Creat exercice.py
    code  = code[1:-1].split("\\n")
    print(code)
    fdOut = open("./ejercicio.py","w")
    for line in code:
            fdOut.write(line + "\n")
    
    # Run process
    exercice = subprocess.Popen(["python","ejercicio.py"],stdout=subprocess.PIPE,preexec_fn=os.setsid)
    

    headers = {'Content-Type': 'text/plain','Access-Control-Allow-Origin': '*'}
    return make_response('Ok', 200, headers)



# ----------------------------------------------------------------------
#                        MAIN PROGRAM
# ----------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)