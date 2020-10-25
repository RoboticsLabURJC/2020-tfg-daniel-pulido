char input;

void setup(){

  pinMode(LED_BUILTIN, OUTPUT); // Declaramos que utilizaremos el pin 2 como salida
  digitalWrite(LED_BUILTIN,LOW);
  Serial.begin(9600);
}

void loop(){
  if (Serial.available()>0){

    input=Serial.read();

    if (input=='1'){

      digitalWrite(LED_BUILTIN, HIGH); //Si el valor de input es 1, se enciende el led

    }

    else if(input=='0')

    {

      digitalWrite(LED_BUILTIN, LOW); //Si el valor de input es 2, se apaga el LED

    }

  }
