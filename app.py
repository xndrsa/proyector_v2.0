from app import create_app
import subprocess
import time
import requests

def start_ngrok():
    subprocess.Popen(['ngrok', 'http', '5000'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    time.sleep(2)
    response = requests.get("http://127.0.0.1:4040/api/tunnels")
    tunnels = response.json().get("tunnels", [])
    if tunnels:
        ngrok_url = tunnels[0]["public_url"]
        print(f"Tu URL pública de Ngrok es: {ngrok_url}")
    else:
        print("No se pudo obtener la URL pública de Ngrok.")
    return ngrok_url

app = create_app()

if __name__ == "__main__":
    # start_ngrok()  # Si más adelante quieres usarlo, quita el comentario
    app.run(host='0.0.0.0', port=5000, debug=True)
