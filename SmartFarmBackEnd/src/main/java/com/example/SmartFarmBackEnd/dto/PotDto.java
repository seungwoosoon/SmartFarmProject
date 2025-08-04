package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Plant;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import lombok.Data;

@Data
public class PotDto {
    private Integer position;
    private PotStatus status;
    private Plant plant;
    // (필요하다면 센서값들 추가)

    public static PotDto from(Pot p) {
        PotDto dto = new PotDto();
        dto.setPosition(p.getPosition());
        dto.setStatus(p.getStatus());
        dto.setPlant(p.getPotPlant());
        return dto;
    }
}