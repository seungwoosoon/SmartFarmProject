package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PotRepository {

    private final EntityManager em;

    public Long save(Pot pot) {
        em.persist(pot);
        return pot.getId();
    }

    public Pot findOne(Long id) {
        return em.find(Pot.class, id);
    }

    public List<Pot> findAll() {
        return em.createQuery("select p from Pot p", Pot.class).getResultList();
    }
    // ✅ 특정 상태의 Pot들 조회
    public List<Pot> findByStatus(PotStatus status) {
        return em.createQuery(
                        "select p from Pot p where p.potStatus = :status", Pot.class)
                .setParameter("status", status)
                .getResultList();
    }
    public void delete(Pot pot) {
        ShelfFloor floor = pot.getShelfFloor();
        if (floor != null) {
            floor.getPots().remove(pot); // 🔁 양방향 연결 끊기
        }

        em.remove(pot); // 🔻 DB에서 삭제
    }
}