package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Image;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.dto.ImageUploadResponseDto;
import com.example.SmartFarmBackEnd.repository.MemberRepository;
import com.example.SmartFarmBackEnd.service.ImageService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/image")
public class ImageController {

    private final ImageService imageService;
    private final MemberRepository memberRepository;

    // 업로드 (세션 필수)
    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponseDto> upload(@RequestParam("file") MultipartFile file,
                                                         HttpSession session) throws IOException {
        Long memberId = (Long) session.getAttribute("LOGIN_MEMBER");
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Image image = imageService.upload(file, member);
        return ResponseEntity.ok(new ImageUploadResponseDto(image.getId(), image.getImageUrl()));
    }

    // 내 프로필 이미지 조회 (세션 필수, 기본이미지 없음)
    @GetMapping("/me")
    public ResponseEntity<ImageUploadResponseDto> getMyImage(HttpSession session) {
        Long memberId = (Long) session.getAttribute("LOGIN_MEMBER");
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Image image = imageService.getByMember(member);
        if (image == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(new ImageUploadResponseDto(image.getId(), image.getImageUrl()));
    }
}