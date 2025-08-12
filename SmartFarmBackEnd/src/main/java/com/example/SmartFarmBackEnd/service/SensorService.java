package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Plant;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorService {

    private final PotRepository potRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Long MEMBER_ID = 1L;  // 고정 멤버
    private static final int X = 0, Y = 0, G = 0; // 고정 좌표

    @Transactional
    public void processSensorMessage(String payload) {
        if (payload == null) return;
        String s = payload.trim();

        // JSON이 아니면 (temp:25, humi:44 ...) 형태를 {"temp":25,"humi":44,...} 로 보정 시도
        if (!(s.startsWith("{") || s.startsWith("["))) {
            s = fixPayloadIfNeeded(s);
            if (s == null) {
                log.debug("[MQTT] JSON 아님 → 스킵: {}", payload.length()>120?payload.substring(0,120)+"...":payload);
                return;
            }
        }

        Pot pot = potRepository.findByPosition(MEMBER_ID, X, Y, G);
        if (pot == null) { log.debug("[MQTT] (0,0,0) Pot 없음 → 스킵"); return; }
        if (pot.getStatus() == PotStatus.EMPTY || pot.getPotPlant() == Plant.EMPTY) {
            log.debug("[MQTT] (0,0,0) EMPTY 상태 → 스킵"); return;
        }

        try {
            JsonNode j = objectMapper.readTree(s);

            // 값 있으면만 반영 (문자열 숫자도 허용)
            Double ph   = parseD(j.get("ph"));
            Double temp = parseD(j.get("temp"));                     // temperature 대체 필요시 parseD(j.get("temperature"))
            Double cds  = parseD(j.get("cds"));                      // 조도
            Double tds  = parseD(j.get("tds"));
            Double humi = parseD(j.get("humi"));

            PotStatus status = null;

            pot.applySensor(ph, temp, cds, tds, humi, status, 0.1);

        } catch (Exception e) {
            log.warn("[MQTT] JSON 파싱 실패(보정 후): {}", e.getMessage());
        }
    }

    /** 숫자 노드/문자 숫자 모두 Double로 파싱 */
    private static Double parseD(JsonNode n) {
        if (n == null || n.isNull()) return null;
        try {
            if (n.isNumber()) return n.asDouble();
            if (n.isTextual()) return Double.valueOf(n.asText().trim());
        } catch (Exception ignored) {}
        return null;
    }

    /** temp:25, humi:44 같이 온 문자열을 JSON으로 보정 */
    private static String fixPayloadIfNeeded(String raw) {
        String s = raw.trim();
        // 양끝에 중괄호 없으면 감싸기
        if (!s.startsWith("{")) s = "{" + s + "}";
        // 키에 따옴표 추가: word:  → "word":
        s = s.replaceAll("(?<![\"\\\\])\\b([A-Za-z0-9_]+)\\s*:", "\"$1\":");
        // 단일따옴표 값을 이중따옴표로
        s = s.replace('\'', '"');
        // 아주 기본적인 유효성만 체크
        return (s.startsWith("{") && s.endsWith("}")) ? s : null;
    }
}