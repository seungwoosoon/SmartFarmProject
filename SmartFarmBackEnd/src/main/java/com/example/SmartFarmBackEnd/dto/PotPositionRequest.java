package com.example.SmartFarmBackEnd.dto;

import lombok.Data;

@Data
public class PotPositionRequest {
    private int shelfPosition;
    private int floorPosition;
    private int potPosition;
}
