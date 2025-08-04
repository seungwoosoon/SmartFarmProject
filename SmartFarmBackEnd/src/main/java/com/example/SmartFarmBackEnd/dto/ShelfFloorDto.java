package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import lombok.Data;

import java.util.List;

@Data
public class ShelfFloorDto {
    private Integer position;
    private List<PotDto> pots;

    public static ShelfFloorDto from(ShelfFloor f) {
        ShelfFloorDto dto = new ShelfFloorDto();
        dto.setPosition(f.getPosition());
        dto.setPots(
                f.getPots().stream()
                        .map(PotDto::from)
                        .toList()
        );
        return dto;
    }
}