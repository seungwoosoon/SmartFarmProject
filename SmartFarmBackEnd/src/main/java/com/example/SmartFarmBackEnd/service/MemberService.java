package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;

    public Member findById(Long id) {
        return memberRepository.findById(id);
    }

}