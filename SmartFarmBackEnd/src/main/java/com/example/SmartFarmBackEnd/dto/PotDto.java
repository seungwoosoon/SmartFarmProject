package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Plant;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import lombok.Data;

@Data
public class PotDto {
    private PositionDto position;
    private PotStatus status;
    private Plant plant = Plant.SPROUT;
    private double ph = 7.5;
    private double temperature = 26.5;
    private double lightStrength = 3;
    private double ttsDensity = 2;
    private double humidity = 4.5;
    private double exp = 0.0;

    public static PotDto from(Pot p) {
        PotDto dto = new PotDto();
        dto.setPosition(new PositionDto(
                p.getShelfFloor().getShelf().getPosition(),
                p.getShelfFloor().getPosition(),
                p.getPosition()
        ));
        dto.setStatus(p.getStatus());
        dto.setPlant(p.getPotPlant());
        dto.setExp(p.getExp());
        dto.setPh(p.getPh());
        dto.setTemperature(p.getTemperature());
        dto.setLightStrength(p.getLightStrength());
        dto.setTtsDensity(p.getTtsDensity());
        dto.setHumidity(p.getHumidity());
        return dto;
    }
}