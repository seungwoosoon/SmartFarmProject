package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Plant;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import lombok.Data;

@Data
public class PotDto {
    private Integer position;
    private PotStatus status;
    private Plant plant = Plant.TOMATO;
    private double ph = 7.5;
    private double temperature = 26.5;
    private double lightStrength = 3;
    private double ttsDensity = 2;
    private double humidity = 4.5;

    public static PotDto from(Pot p) {
        PotDto dto = new PotDto();
        dto.setPosition(p.getPosition());
        dto.setStatus(p.getStatus());
        dto.setPlant(p.getPotPlant());
        return dto;
    }
}