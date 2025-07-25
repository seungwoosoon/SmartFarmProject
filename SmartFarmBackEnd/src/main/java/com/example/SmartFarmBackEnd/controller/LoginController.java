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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;


@RestController
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;
    private final FarmService farmService;

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
    @PostMapping("/join")
    public ResponseEntity<String> join(@RequestBody @Validated MemberJoinRequestDto request) {
        // AddressDto → Address
        Address address = new Address(
                request.getAddress().getCity(),
                request.getAddress().getStreet(),
                request.getAddress().getZipcode()
        );

        // Member 생성
        Member member = new Member(
                request.getLogin(),
                request.getPassword(),
                request.getName(),
                request.getPhoneNumber(),
                address
        );
        loginService.join(member);

        return ResponseEntity.ok("회원가입 성공");
    }
}
