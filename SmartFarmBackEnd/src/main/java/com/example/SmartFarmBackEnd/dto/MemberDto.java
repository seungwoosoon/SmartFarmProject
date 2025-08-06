package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Member;
import lombok.Data;

import java.util.List;

@Data
public class MemberDto {
    private Long id;
    private String name;
    private List<ShelfDto> shelves;

    public static MemberDto from(Member m) {
        MemberDto dto = new MemberDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setShelves(
                m.getFarmShelves().stream()
                        .map(ShelfDto::from)
                        .toList()
        );
        return dto;
    }
}