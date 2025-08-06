package com.example.SmartFarmBackEnd.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class ImageUploadResponseDto {
    private Long imageId;
    private String imageUrl;
}