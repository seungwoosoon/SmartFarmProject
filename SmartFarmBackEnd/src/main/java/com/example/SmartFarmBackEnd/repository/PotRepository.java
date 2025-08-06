package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
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
                        "select p from Pot p where p.status = :status", Pot.class)
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

    public Pot findByPosition(Long memberId,
                              int shelfPosition,
                              int floorPosition,
                              int potPosition) {
        String jpql = """
            select p
              from Pot p
              join p.shelfFloor f
              join f.shelf s
              join s.member m
             where m.id = :memberId
               and s.position = :shelfPos
               and f.position = :floorPos
               and p.position = :potPos
        """;
        try {
            return em.createQuery(jpql, Pot.class)
                    .setParameter("memberId", memberId)
                    .setParameter("shelfPos",   shelfPosition)
                    .setParameter("floorPos",   floorPosition)
                    .setParameter("potPos",     potPosition)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
    /** 2) 특정 줄(Floor)의 모든 Pot 조회 */
    public List<Pot> findAllByFloor(Long memberId,
                                    int shelfPosition,
                                    int floorPosition) {
        String jpql = """
            select p
              from Pot p
              join p.shelfFloor f
              join f.shelf s
              join s.member m
             where m.id = :memberId
               and s.position = :shelfPos
               and f.position = :floorPos
        """;
        return em.createQuery(jpql, Pot.class)
                .setParameter("memberId", memberId)
                .setParameter("shelfPos",   shelfPosition)
                .setParameter("floorPos",   floorPosition)
                .getResultList();
    }

    /** 3) 특정 선반(Shelf)의 모든 Pot 조회 */
    public List<Pot> findAllByShelf(Long memberId,
                                    int shelfPosition) {
        String jpql = """
            select p
              from Pot p
              join p.shelfFloor f
              join f.shelf s
              join s.member m
             where m.id = :memberId
               and s.position = :shelfPos
        """;
        return em.createQuery(jpql, Pot.class)
                .setParameter("memberId", memberId)
                .setParameter("shelfPos", shelfPosition)
                .getResultList();
    }

}