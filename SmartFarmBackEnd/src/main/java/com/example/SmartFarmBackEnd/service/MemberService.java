package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.*;
import com.example.SmartFarmBackEnd.dto.ProfileUpdateRequest;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {
    private final MemberRepository memberRepository;

    public Optional<Member> findById(Long id) {
        return memberRepository.findById(id);
    }

    @Transactional
    public Member updateProfile(Long memberId, ProfileUpdateRequest req) {
        Member m = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        m.setName(req.getName());

        // 값 객체 Address는 불변처럼 쓰는 게 좋으므로 새로 교체
        Address newAddress = new Address(
                req.getAddress().getCity(),
                req.getAddress().getStreet(),
                req.getAddress().getZipcode()
        );
        m.setAddress(newAddress); // 기존 null 여부 상관없이 교체

        return m; // dirty checking
    }
    @Transactional
    public void deleteAccount(Long memberId) {
        Member m = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        memberRepository.delete(m); // Member → Shelf → Floor → Pot cascade 로 삭제
    }
}