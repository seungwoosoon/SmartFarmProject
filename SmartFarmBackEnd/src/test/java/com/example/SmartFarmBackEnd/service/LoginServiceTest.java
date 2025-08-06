package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import jakarta.persistence.EntityManager;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class LoginServiceTest {
    @Autowired LoginService loginService;
    @Autowired MemberRepository memberRepository;
    @Autowired
    EntityManager em;
    @Test
    public void join() {
        Member member = new Member();
        member.setName("Jack");

        Long saveId = loginService.join(member);
        Optional<Member> findMember = memberRepository.findById(saveId);

        em.flush();
        Assertions.assertThat(member).isEqualTo(findMember);
    }
}