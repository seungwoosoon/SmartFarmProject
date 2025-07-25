package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.*;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import com.example.SmartFarmBackEnd.repository.ShelfFloorRepository;
import com.example.SmartFarmBackEnd.repository.ShelfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final MemberRepository memberRepository;
    private final ShelfFloorRepository shelfFloorRepository;
    private final ShelfRepository shelfRepository;
    private final PotRepository potRepository;
    @Transactional
    public Member createMemberWithEmptyFarm(Member member) {
        for (int i = 0; i < 5; i++) {
            Shelf shelf = new Shelf();
            shelf.setPosition(i);
            shelf.linkMember(member);

            for (int j = 0; j < 5; j++) {
                ShelfFloor floor = new ShelfFloor();
                floor.setPosition(j);
                floor.linkShelf(shelf);

                for (int k = 0; k < 4; k++) {
                    Pot pot = new Pot();
                    pot.setPosition(k);
                    pot.setPotStatus(0);
                    pot.linkShelfFloor(floor);
                    floor.getPots().add(pot);
                    potRepository.save(pot);
                }
                shelf.getShelfFloors().add(floor);
                shelfFloorRepository.save(floor);
            }
            shelfRepository.save(shelf);
            member.getFarmShelves().add(shelf);
        }


        memberRepository.save(member);
        return member;
    }
    @Transactional
    public void updatePotStatus(Long potId,
                                PotStatus status,
                                double soilHumidity,
                                double temperature,
                                double lightStrength,
                                double ttsDensity,
                                double humidity,
                                Plant plant) {
        Pot pot = potRepository.findOne(potId);
        if (pot == null) {
            throw new IllegalArgumentException("해당 ID의 Pot이 존재하지 않습니다.");
        }
        pot.updateStatus(status, soilHumidity, temperature, lightStrength, ttsDensity, humidity, plant);
    }

    @Transactional
    public void deletePot(Long potId) {
        Pot pot = potRepository.findOne(potId);
        if (pot == null) {
            throw new IllegalArgumentException("해당 ID의 Pot이 존재하지 않습니다.");
        }

        // 연관된 floor에서도 제거 (orphanRemoval을 쓰더라도 객체 그래프 정리를 위해 명시적으로)
        ShelfFloor floor = pot.getShelfFloor();
        if (floor != null) {
            floor.getPots().remove(pot);
        }

        potRepository.delete(pot);
    }
}
