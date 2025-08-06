package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Image;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageService {

    private final ImageRepository imageRepository;

    private final String uploadDir = "uploads/";

    /**
     * 로그인된 사용자의 프로필 이미지 업로드 (기존 이미지 있으면 삭제)
     */
    public Image upload(MultipartFile file, Member member) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }

        // 기존 이미지 있으면 삭제
        imageRepository.findByMember(member).ifPresent(existing -> {
            try {
                Path existingPath = Paths.get(uploadDir + existing.getImageUrl().replace("/images/", ""));
                Files.deleteIfExists(existingPath);
                imageRepository.delete(existing);
            } catch (IOException ignored) {}
        });

        // 저장 경로 설정
        String original = file.getOriginalFilename();
        String stored = UUID.randomUUID() + "_" + original;
        Path path = Paths.get(uploadDir + stored);
        Files.createDirectories(path.getParent());
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        // 저장
        String imageUrl = "/images/" + stored;
        Image image = new Image(imageUrl, member);
        return imageRepository.save(image);
    }
    public void createDefaultProfile(Member member) {
        // static/images/default-profile.png 를 기본 URL로 지정
        String defaultUrl = "/bee.png";
        Image img = new Image(defaultUrl, member);
        imageRepository.save(img);
    }

    /**
     * 로그인된 사용자의 프로필 이미지 조회
     */
    public Image getProfileImage(Member member) {
        return imageRepository.findByMember(member).orElse(null);
    }

    // imageService에 다음 메서드가 있어야 합니다.
    public Image getByMember(Member member) {
        return imageRepository.findByMember(member).orElse(null);
    }
}