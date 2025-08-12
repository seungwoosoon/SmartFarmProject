int AA = 5;  // 모터A IN1
int AB = 4;  // 모터A IN2
int BA = 6;  // 모터B IN3
int BB = 7;  // 모터B IN4

void setup() {
  pinMode(AA, OUTPUT);
  pinMode(AB, OUTPUT);
  pinMode(BA, OUTPUT);
  pinMode(BB, OUTPUT);

  // 전원 켜자마자 ON
  digitalWrite(AA, HIGH);
  digitalWrite(AB, LOW);
  digitalWrite(BA, HIGH);
  digitalWrite(BB, LOW);
}

void loop() {
  // 계속 켜진 상태 유지 (아무 동작 없음)
}
