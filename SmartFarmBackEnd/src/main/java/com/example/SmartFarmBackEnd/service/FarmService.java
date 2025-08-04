package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.*;
import com.example.SmartFarmBackEnd.dto.LineRequest;
import com.example.SmartFarmBackEnd.dto.PotPositionRequest;
import com.example.SmartFarmBackEnd.dto.ShelfRequest;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import com.example.SmartFarmBackEnd.repository.ShelfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FarmService {

    private final MemberRepository memberRepository;
    private final PotRepository potRepository;

    public Long createMemberWithEmptyFarm(Member member) {
        // 1) 빈 선반 하나
        Shelf shelf = new Shelf();
        shelf.setPosition(0);
        member.addShelf(shelf);

        // 2) 4개 층
        for (int floorIdx = 0; floorIdx < 4; floorIdx++) {
            ShelfFloor floor = new ShelfFloor();
            floor.setPosition(floorIdx);
            shelf.addFloor(floor);

            // 3) 각 층에 5개 화분
            for (int potIdx = 0; potIdx < 5; potIdx++) {
                Pot pot = new Pot();
                pot.setPosition(potIdx);
                floor.addPot(pot);
            }
        }

        // cascade = ALL 로, member만 save 해도 하위 전부 영속화
        return memberRepository.save(member);
    }

    // 화분 하나 상태/식물 업데이트 (원본 메서드)
    public void updatePotStatus(Long potId,
                                PotStatus status,
                                double ph,
                                double temperature,
                                double lightStrength,
                                double ttsDensity,
                                double humidity,
                                Plant plant) {
        Pot pot = potRepository.findOne(potId);
        if (pot == null) {
            throw new IllegalArgumentException("해당 ID의 Pot이 존재하지 않습니다.");
        }
        pot.updateStatus(status, ph, temperature, lightStrength, ttsDensity, humidity, plant);
    }


    // 화분 하나 추가 → EMPTY → NORMAL + TOMATO
    public Pot addPot(Long memberId,
                      PotPositionRequest req) {
        Pot pot = potRepository.findByPosition(
                memberId,
                req.getShelfPosition(),
                req.getFloorPosition(),
                req.getPotPosition()
        );
        if (pot == null) throw new IllegalArgumentException("해당 pot이 없습니다.");

        pot.updateStatus(
                PotStatus.NORMAL,
                0, 0, 0, 0, 0,
                Plant.TOMATO
        );
        return pot;
    }

    // 한 줄 추가 → 해당 floor의 모든 pot
    public List<Pot> addLine(Long memberId,
                             LineRequest req) {
        List<Pot> pots = potRepository.findAllByFloor(
                memberId,
                req.getShelfPosition(),
                req.getFloorPosition()
        );
        if (pots.isEmpty()) throw new IllegalArgumentException("해당 줄이 없습니다.");

        pots.forEach(p ->
                p.updateStatus(
                        PotStatus.NORMAL,
                        0, 0, 0, 0, 0,
                        Plant.TOMATO
                )
        );
        return pots;
    }

    // 선반 전체 추가 → shelf 내 모든 pot
    public List<Pot> addShelf(Long memberId,
                              ShelfRequest req) {
        List<Pot> pots = potRepository.findAllByShelf(
                memberId,
                req.getShelfPosition()
        );
        if (pots.isEmpty()) throw new IllegalArgumentException("해당 선반이 없습니다.");

        pots.forEach(p ->
                p.updateStatus(
                        PotStatus.NORMAL,
                        0, 0, 0, 0, 0,
                        Plant.TOMATO
                )
        );
        return pots;
    }

    // 화분 하나 삭제 → 상태·식물 모두 EMPTY로
    public Pot deletePot(Long memberId,
                         PotPositionRequest req) {
        Pot pot = potRepository.findByPosition(
                memberId,
                req.getShelfPosition(),
                req.getFloorPosition(),
                req.getPotPosition()
        );
        if (pot == null) throw new IllegalArgumentException("해당 pot이 없습니다.");

        pot.updateStatus(
                PotStatus.EMPTY,
                0, 0, 0, 0, 0,
                Plant.EMPTY
        );
        return pot;
    }

    // 줄 삭제 → 모든 pot EMPTY
    public List<Pot> deleteLine(Long memberId,
                                LineRequest req) {
        List<Pot> pots = potRepository.findAllByFloor(
                memberId,
                req.getShelfPosition(),
                req.getFloorPosition()
        );
        pots.forEach(p ->
                p.updateStatus(
                        PotStatus.EMPTY,
                        0, 0, 0, 0, 0,
                        Plant.EMPTY
                )
        );
        return pots;
    }

    // 선반 전체 삭제 → 모든 pot EMPTY
    public List<Pot> deleteShelf(Long memberId,
                                 ShelfRequest req) {
        List<Pot> pots = potRepository.findAllByShelf(
                memberId,
                req.getShelfPosition()
        );
        pots.forEach(p ->
                p.updateStatus(
                        PotStatus.EMPTY,
                        0, 0, 0, 0, 0,
                        Plant.EMPTY
                )
        );
        return pots;
    }

    // 내 농장 전체 조회 (readOnly 추천)
    @Transactional(readOnly = true)
    public Member selectFarm(Long memberId) {
        return memberRepository.findWithShelves(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));
    }
}