package com.example.SmartFarmBackEnd.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberResponseDto {
    private String name;
    private String phoneNumber;
    private AddressDto address;
}