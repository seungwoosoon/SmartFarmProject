package com.example.SmartFarmBackEnd.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank
    private String name;

    @Valid
    @NotNull
    private AddressDto address; // city, street, zipcode
}