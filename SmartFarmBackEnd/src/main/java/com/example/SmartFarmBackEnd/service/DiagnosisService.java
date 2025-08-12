package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Plant;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import com.example.SmartFarmBackEnd.dto.DiagnosisRequest;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiagnosisService {

    private final PotRepository potRepository;

    private static final long MEMBER_ID = 1L;
    private static final int X = 0, Y = 0, G = 0;

    // 진단명 -> PotStatus 매핑 (너의 enum 이름 그대로 사용)
    private PotStatus mapClassNameToStatus(String className) {
        if (className == null || className.isBlank()) return PotStatus.NORMAL;

        String k = className.trim().toLowerCase(Locale.ROOT);

        // 병해
        if (k.equals("gray mold") || k.contains("gray") && k.contains("mold") || k.contains("botrytis") || k.contains("회색곰팡이"))
            return PotStatus.GRAYMOLD;
        if (k.equals("powdery mildew") || k.contains("powdery") && k.contains("mildew") || k.contains("흰가루병"))
            return PotStatus.POWDERYMILDEW;

        // 결핍
        if (k.equals("nitrogen deficiency") || k.contains("nitrogen") || k.contains("질소"))
            return PotStatus.NITROGENDEFICIENCY;
        if (k.equals("phosphorus deficiency") || k.contains("phosph") || k.contains("phosphorus") || k.contains("인산"))
            return PotStatus.PHOSPHROUSDEFICIENCY;
        if (k.equals("potassium deficiency") || k.contains("potassium") || k.contains("칼륨"))
            return PotStatus.POTASSIUMDEFICIENCY;

        return PotStatus.NORMAL; // 기본값
    }

    @Transactional
    public void applyDiagnosis(String className) {
        Pot pot = potRepository.findByPosition(MEMBER_ID, X, Y, G);
        if (pot == null) {
            log.info("[AI] Pot (member={}, x={}, y={}, g={}) 없음 → 스킵", MEMBER_ID, X, Y, G);
            return;
        }

        PotStatus before = pot.getStatus();
        Plant plant = pot.getPotPlant();
        PotStatus after = mapClassNameToStatus(className);

        if (before == PotStatus.EMPTY || plant == Plant.EMPTY) {
            log.info("[AI] 스킵: before={}, plant={}, mapped={}", before, plant, after);
            return;
        }
        if (before == after) {
            log.info("[AI] 상태 동일 → 변경 없음: {}", before);
            return;
        }

        pot.applyStatus(after);
        log.info("[AI] 상태 업데이트: {} → {}", before, after);
    }
}