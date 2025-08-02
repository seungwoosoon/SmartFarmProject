package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.Member;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
@RequiredArgsConstructor
public class MemberRepository {

    private final EntityManager em;

    // 저장
    public Long save(Member member) {
        em.persist(member);
        return member.getId();
    }

    // ID로 조회
    public Optional<Member> findById(Long id) {
        return Optional.ofNullable(em.find(Member.class, id));
    }

    // login (username) 으로 조회
    public Optional<Member> findByLogin(String login) {
        return em.createQuery("select m from Member m where m.login = :login", Member.class)
                .setParameter("login", login)
                .getResultList()
                .stream()
                .findFirst();
    }

    // 전체 조회 (옵션)
    public List<Member> findAll() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }

    // 삭제
    public void delete(Member member) {
        em.remove(member);
    }
}
