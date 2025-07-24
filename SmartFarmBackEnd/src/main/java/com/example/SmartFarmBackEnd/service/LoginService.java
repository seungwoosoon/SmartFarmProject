package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<Member> login(String username, String rawPassword) {
        return memberRepository.findByLogin(username)
                .filter(m -> passwordEncoder.matches(rawPassword, m.getPassword()));
    }
}
