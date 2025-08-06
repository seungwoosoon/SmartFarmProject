package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LoginService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<Member> login(String username, String rawPassword) {
        return memberRepository.findByLogin(username)
                .filter(m -> passwordEncoder.matches(rawPassword, m.getPassword()));
    }

    public Long join(Member member) {
        this.getValidateDuplicateMember(member);
        String encodedPassword = passwordEncoder.encode(member.getPassword());
        member.setPassword(encodedPassword);
        return this.memberRepository.save(member);
    }

    private void getValidateDuplicateMember(Member member) {
        Optional<Member> findMember = this.memberRepository.findByLogin(member.getLogin()); // ✅ login 기준
        if (findMember.isPresent()) {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }

    public boolean existsByLogin(String login) {
        return this.memberRepository.findByLogin(login).isPresent();
    }
}
