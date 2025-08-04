package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Shelf;
import lombok.Data;

import java.util.List;

@Data
public class ShelfDto {
    private Integer position;
    private List<ShelfFloorDto> floors;

    public static ShelfDto from(Shelf s) {
        ShelfDto dto = new ShelfDto();
        dto.setPosition(s.getPosition());
        dto.setFloors(
                s.getShelfFloors().stream()
                        .map(ShelfFloorDto::from)
                        .toList()
        );
        return dto;
    }
}
