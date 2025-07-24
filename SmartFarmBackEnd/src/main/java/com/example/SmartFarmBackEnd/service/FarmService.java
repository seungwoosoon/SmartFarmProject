package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public class FarmService {

    // ✅ 특정 층(ShelfFloor)의 Pot만 조회
    public List<Pot> findByShelfFloor(ShelfFloor floor) {
        return floor.getPots(); // 단순 getter 사용
    }


    // (1) Member 기준 Pot 전체 조회
    public List<Pot> findAllByMemberId(Long memberId) {
        return em.createQuery(
                        "select p from Pot p " +
                                "join fetch p.shelfFloor f " +
                                "join fetch f.shelf s " +
                                "where s.member.id = :memberId", Pot.class)
                .setParameter("memberId", memberId)
                .getResultList();
    }

    // (2) Shelf 기준 Pot 전체 조회
    public List<Pot> findAllByShelfId(Long shelfId) {
        return em.createQuery(
                        "select p from Pot p " +
                                "join fetch p.shelfFloor f " +
                                "where f.shelf.id = :shelfId", Pot.class)
                .setParameter("shelfId", shelfId)
                .getResultList();
    }
    
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
                }
                shelf.getShelfFloors().add(floor);
            }

            member.getFarmShelves().add(shelf);
        }

        memberRepository.save(member);
        return member;
    }
}
