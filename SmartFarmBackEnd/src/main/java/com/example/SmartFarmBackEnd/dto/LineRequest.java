package com.example.SmartFarmBackEnd.dto;

import lombok.Data;

@Data
public class LineRequest {
    private int shelfPosition;
    private int floorPosition;
}