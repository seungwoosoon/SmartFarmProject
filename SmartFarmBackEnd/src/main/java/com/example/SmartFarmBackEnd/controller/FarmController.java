package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.dto.MemberDto;
import com.example.SmartFarmBackEnd.service.FarmService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class FarmController {
    private FarmService farmService;
    private Long getSessionMemberId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("memberId") == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (Long) session.getAttribute("memberId");
    }
    @GetMapping("/api/STRUCTURE_URL")
    public ResponseEntity<MemberDto> getFarmStructure(HttpServletRequest request) {
        Long memberId = getSessionMemberId(request);
        Member member = farmService.selectFarm(memberId);
        return ResponseEntity.ok(MemberDto.from(member));
    }
}
