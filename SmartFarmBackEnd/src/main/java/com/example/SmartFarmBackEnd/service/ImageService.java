package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Image;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.repository.ImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.*;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImageService {

    private final ImageRepository imageRepository;

    @Value("${app.upload-dir:/app/uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED = Set.of("jpg","jpeg","png","webp","gif");

    public Image upload(MultipartFile file, Member member) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }

        // 파일명/확장자
        String original = safeBaseName(file.getOriginalFilename());
        String ext = safeExtension(original, file.getContentType());
        if (!ALLOWED.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않은 확장자: " + ext);
        }

        // 이미지 여부 검사 (간단한 콘텐츠 스니핑)
        byte[] bytes = file.getBytes();
        try (var bis = new ByteArrayInputStream(bytes)) {
            if (ImageIO.read(bis) == null) {
                throw new IllegalArgumentException("이미지 형식이 아닙니다.");
            }
        }

        // 디렉토리/경로
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);

        String stored = UUID.randomUUID() + "." + ext;
        Path target = root.resolve(stored).normalize();
        if (!target.startsWith(root)) {
            throw new SecurityException("잘못된 경로");
        }

        // 파일 저장
        try (var in = new ByteArrayInputStream(bytes)) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // 기존 엔티티 있으면 URL만 업데이트(파일은 방금 새로 썼으니 과거 파일 삭제)
        var existingOpt = imageRepository.findByMember(member);
        if (existingOpt.isPresent()) {
            Image existing = existingOpt.get();
            // 과거 파일 삭제 (실패해도 치명적 아님)
            try {
                String oldName = Paths.get(existing.getImageUrl()).getFileName().toString();
                Path oldPath = root.resolve(oldName).normalize();
                if (oldPath.startsWith(root)) Files.deleteIfExists(oldPath);
            } catch (IOException e) {
                log.warn("기존 이미지 파일 삭제 실패: {}", e.getMessage());
            }
            existing.setImageUrl("/images/" + stored);
            return existing; // JPA 변경감지
        }

        // 새 엔티티 생성
        Image image = new Image("/images/" + stored, member);
        return imageRepository.save(image);
    }

    public Image getByMember(Member member) {
        return imageRepository.findByMember(member).orElse(null);
    }

    // ---- helpers ----
    private String safeBaseName(String original) {
        if (original == null) return "file";
        String base = Paths.get(original).getFileName().toString();
        return base.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private String safeExtension(String original, String contentType) {
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot > -1 && dot < original.length() - 1) {
            ext = original.substring(dot + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.isBlank() && contentType != null) {
            if (contentType.equalsIgnoreCase("image/jpeg")) ext = "jpg";
            else if (contentType.equalsIgnoreCase("image/png")) ext = "png";
            else if (contentType.equalsIgnoreCase("image/webp")) ext = "webp";
            else if (contentType.equalsIgnoreCase("image/gif")) ext = "gif";
        }
        return ext;
    }
}