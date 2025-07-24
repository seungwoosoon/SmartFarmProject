package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.service.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String username, @RequestParam String password,
                                        HttpServletRequest request) {
        Optional<Member> optionalMember = loginService.login(username, password);

        if (optionalMember.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 회원입니다.");
        }

        Member member = optionalMember.get();
        if (!member.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
        }

        // 로그인 성공 → 세션 생성
        HttpSession session = request.getSession(true); // true = 없으면 생성
        session.setMaxInactiveInterval(60 * 15); // 30분
        session.setAttribute("LOGIN_MEMBER", member.getId());

        return ResponseEntity.ok("로그인 성공. 세션ID: " + session.getId());
    }
}
