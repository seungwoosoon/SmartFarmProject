#define SensorPin A0
#define Offset 0.33
#define LED 13
#define samplingInterval 20
#define printInterval 800
#define ArrayLenth 40

int pHArray[ArrayLenth];
int pHArrayIndex = 0;

void setup(void) {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("pH meter experiment!");
}

void loop(void) {
  static unsigned long samplingTime = millis();
  static unsigned long printTime = millis();
  static float pHValue, voltage;

  if (millis() - samplingTime > samplingInterval) {
    pHArray[pHArrayIndex++] = analogRead(SensorPin);
    if (pHArrayIndex == ArrayLenth) pHArrayIndex = 0;

    voltage = avergearray(pHArray, ArrayLenth) * 5.0 / 1024.0;
    pHValue = 3.5 * voltage + Offset;

    samplingTime = millis();
  }

  if (millis() - printTime > printInterval) {
    Serial.print("Voltage: ");
    Serial.print(voltage, 2);
    Serial.print("    pH value: ");
    Serial.println(pHValue, 2);
    digitalWrite(LED, !digitalRead(LED));
    printTime = millis();
  }
}

double avergearray(int* arr, int number) {
  if (number <= 0) return 0;

  long amount = 0;
  int min = arr[0], max = arr[0];

  if (number < 5) {
    for (int i = 0; i < number; i++) amount += arr[i];
    return (double)amount / number;
  }

  for (int i = 1; i < number; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
    amount += arr[i];
  }

  amount -= min;
  amount -= max;

  return (double)amount / (number - 2);
}
