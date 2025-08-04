package com.example.SmartFarmBackEnd.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// dto/AddressDto.java
@Getter
@Setter
@AllArgsConstructor
public class AddressDto {
    @NotBlank
    private String city;
    @NotBlank
    private String street;
    @NotBlank
    private String zipcode;
}
