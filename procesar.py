# procesar.py
import sys
import json

def calcular_imc(datos):
    altura = float(datos.get('altura', 1))
    peso = float(datos.get('peso', 0))
    
    # Fórmula del IMC: peso / (altura * altura)
    imc = peso / (altura * altura)
    
    return {"imc": round(imc, 2)}

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])
        resultado = calcular_imc(input_data)
        print(json.dumps(resultado))
    except Exception as e:
        print(json.dumps({"error": str(e)}))