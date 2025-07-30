package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Address;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.dto.MemberJoinRequestDto;
import com.example.SmartFarmBackEnd.service.FarmService;
import com.example.SmartFarmBackEnd.service.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> join(@RequestBody @Validated MemberJoinRequestDto request) {
        System.out.println("🔥 회원가입 요청 도착");
        try {
            Address address = new Address(
                    request.getAddress().getCity(),
                    request.getAddress().getStreet(),
                    request.getAddress().getZipcode()
            );

            Member member = new Member(
                    request.getLogin(),
                    request.getPassword(),
                    request.getName(),
                    request.getPhoneNumber(),
                    address
            );
            loginService.join(member);

            return ResponseEntity.ok("회원가입 성공");
        } catch (Exception e) {
            e.printStackTrace(); // 로그 찍기
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("회원가입 실패: " + e.getMessage());
        }
    }
}