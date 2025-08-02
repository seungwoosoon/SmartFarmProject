package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Image;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.dto.ImageUploadResponseDto;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import com.example.SmartFarmBackEnd.service.ImageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;
    private final MemberRepository memberRepository;

    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponseDto> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("LOGIN_MEMBER") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = (Long) session.getAttribute("LOGIN_MEMBER");
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Image image = imageService.upload(file, member);
        return ResponseEntity.ok(new ImageUploadResponseDto(image.getId(), image.getImageUrl()));
    }

    @GetMapping("/me")
    public ResponseEntity<ImageUploadResponseDto> getMyImage(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("LOGIN_MEMBER") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long memberId = (Long) session.getAttribute("LOGIN_MEMBER");
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Image image = imageService.getByMember(member);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new ImageUploadResponseDto(image.getId(), image.getImageUrl()));
    }
}
