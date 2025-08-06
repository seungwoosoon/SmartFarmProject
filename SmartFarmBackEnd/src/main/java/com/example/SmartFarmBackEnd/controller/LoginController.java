package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Address;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.dto.AddressDto;
import com.example.SmartFarmBackEnd.dto.MemberJoinRequestDto;
import com.example.SmartFarmBackEnd.dto.MemberResponseDto;
import com.example.SmartFarmBackEnd.service.FarmService;
import com.example.SmartFarmBackEnd.service.ImageService;
import com.example.SmartFarmBackEnd.service.LoginService;
import com.example.SmartFarmBackEnd.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder; // 이거 추가됨

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;
    private final FarmService farmService;
    private final PasswordEncoder passwordEncoder;
    private final MemberService memberService;
    private final ImageService imageService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> requestBody,
                                        HttpServletRequest request) {
        String login = requestBody.get("login");
        String password = requestBody.get("password");

        Optional<Member> optionalMember = loginService.login(login, password);

        if (optionalMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다.");
        }

        Member member = optionalMember.get();

        HttpSession session = request.getSession(true);
        session.setMaxInactiveInterval(60 * 15);
        session.setAttribute("LOGIN_MEMBER", member.getId());

        return ResponseEntity.ok("로그인 성공. 세션ID: " + session.getId());
    }

    @PostMapping("/join")
    public ResponseEntity<String> join(
            @Validated @RequestBody MemberJoinRequestDto request,
            HttpServletRequest servletRequest
    ) {
        // 1) 아이디 중복 확인
        if (loginService.existsByLogin(request.getLogin())) {
            return ResponseEntity
                    .badRequest()
                    .body("이미 사용 중인 아이디입니다.");
        }

        // 2) 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3) Address·Member 객체 생성
        Address address = new Address(
                request.getAddress().getCity(),
                request.getAddress().getStreet(),
                request.getAddress().getZipcode()
        );
        Member member = new Member(
                request.getLogin(),
                encodedPassword,
                request.getName(),
                request.getPhoneNumber(),
                address
        );

        // 4) 회원 + 빈 농장 생성 (선반1·층4·화분5)
        Long memberId = farmService.createMemberWithEmptyFarm(member);

        // 5) 기본 프로필 이미지 세팅
        Member saved = memberService.findById(memberId)
                .orElseThrow(() -> new IllegalStateException("회원 저장 중 오류 발생"));
        imageService.createDefaultProfile(saved);

        // 6) 세션에 로그인 정보 저장
        HttpSession session = servletRequest.getSession(true);
        session.setMaxInactiveInterval(60 * 15);  // 15분
        session.setAttribute("LOGIN_MEMBER", member.getId());

        return ResponseEntity.ok("회원가입 성공");
    }
    @GetMapping("/check-login")
    public ResponseEntity<Map<String, Boolean>> checkLogin(@RequestParam String login) {
        boolean available = !loginService.existsByLogin(login);
        return ResponseEntity.ok(Collections.singletonMap("available", available));
    }
    @GetMapping("/me")
    public ResponseEntity<MemberResponseDto> me(HttpSession session) {
        Long memberId = (Long) session.getAttribute("LOGIN_MEMBER");
        if (memberId == null) {
            // 로그인 세션이 없으면 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Member member = memberService.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // Address → AddressDto 변환
        AddressDto addressDto = new AddressDto(
                member.getAddress().getCity(),
                member.getAddress().getStreet(),
                member.getAddress().getZipcode()
        );

        // Member → MemberResponseDto 매핑
        MemberResponseDto dto = new MemberResponseDto();
        dto.setName(member.getName());
        dto.setPhoneNumber(member.getPhoneNumber());
        dto.setAddress(addressDto);

        return ResponseEntity.ok(dto);
    }
}