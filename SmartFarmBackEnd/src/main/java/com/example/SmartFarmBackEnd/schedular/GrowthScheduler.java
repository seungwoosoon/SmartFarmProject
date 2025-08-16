package com.example.SmartFarmBackEnd.schedular;

import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // ✅ 추가
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j // ✅ 로그 지원
@Component
@RequiredArgsConstructor
public class GrowthScheduler {

    private final PotRepository potRepository;

    // 시연 속도 파라미터
    private static final long   TICK_MS   = 5_000; // 5초마다
    private static final double DELTA_EXP = 0.05;  // 틱마다 +0.05 (1.0 되면 COMPLETE)

    @Scheduled(fixedRate = TICK_MS)
    @Transactional
    public void tick() {
        List<Pot> pots = potRepository.findAllNonEmpty();

        log.info("[GrowthDemo] tick start: {} pots found", pots.size());

        for (Pot p : pots) {
            double before = p.getExp();
            p.applyExp(DELTA_EXP);
            double after = p.getExp();
            log.info(" - Pot ID={} | beforeExp={} → afterExp={} | status={}",
                    p.getId(), before, after, p.getStatus());
        }

        log.info("[GrowthDemo] tick end: +{} exp applied to {} pots (every {}ms)",
                DELTA_EXP, pots.size(), TICK_MS);
    }
}