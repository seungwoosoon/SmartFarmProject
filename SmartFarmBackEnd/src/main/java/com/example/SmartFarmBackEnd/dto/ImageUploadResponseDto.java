package com.example.SmartFarmBackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ImageUploadResponseDto {
    private Long imageId;
    private String imageUrl;
}