package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Entity
@Getter
@NoArgsConstructor
public class Pot {

    @Id @GeneratedValue
    @Column(name = "pot_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private ShelfFloor shelfFloor;

    private double exp = 0.0;

    @Column(name = "position")
    private Integer position; // 해당 층(ShelfFloor) 내 항아리 위치

    @Enumerated(EnumType.STRING)
    private Plant potPlant = Plant.EMPTY;

    @Enumerated(EnumType.STRING)
    private PotStatus status = PotStatus.EMPTY;

    private double ph;
    private double temperature;
    private double lightStrength;
    private double ttsDensity;
    private double humidity;

    public void setPosition(int position) {
        this.position = position;
    }

    public void updateStatus(
            PotStatus status,
            double ph,
            double temperature,
            double lightStrength,
            double ttsDensity,
            double humidity,
            double exp,
            Plant plant // nullable
    ) {
        this.status = status;
        this.ph = ph;
        this.temperature = temperature;
        this.lightStrength = lightStrength;
        this.ttsDensity = ttsDensity;
        this.potPlant = plant;
        this.exp = exp;
        this.humidity = humidity;
    }

    public void linkShelfFloor(ShelfFloor floor) {
        this.shelfFloor = floor;
    }
}