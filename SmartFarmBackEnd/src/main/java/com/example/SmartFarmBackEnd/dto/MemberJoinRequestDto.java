package com.example.SmartFarmBackEnd.dto;

import com.example.SmartFarmBackEnd.domain.Address;
import jakarta.persistence.Embedded;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberJoinRequestDto {
    private String login;
    private String password;
    private String name;
    private String phoneNumber;
    private AddressDto address;
}
