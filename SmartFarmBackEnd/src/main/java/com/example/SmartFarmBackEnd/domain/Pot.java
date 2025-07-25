package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
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

    @Column(name = "position")
    private Integer position; // 해당 층(ShelfFloor) 내 항아리 위치

    private Plant potPlant;

    private PotStatus status;

    private double soilHumidity;
    private double temperature;
    private double lightStrength;
    private double ttsDensity;
    private double humidity;

    public void setPosition(int position) {
        this.position = position;
    }

    public void setPotStatus(int status) {
        switch (status) {
            case 0: this.status = PotStatus.EMPTY; break;
            case 1: this.status = PotStatus.NORMAL; break;
            case 2: this.status = PotStatus.WARNING; break;
            case 3: this.status = PotStatus.CRITICAL; break;
        }
    }

    public void updateStatus(
            PotStatus status,
            double soilHumidity,
            double temperature,
            double lightStrength,
            double ttsDensity,
            double humidity,
            Plant plant // nullable
    ) {
        this.status = status;
        this.soilHumidity = soilHumidity;
        this.temperature = temperature;
        this.lightStrength = lightStrength;
        this.ttsDensity = ttsDensity;
        this.potPlant = plant;
        this.humidity = humidity;
    }

    public void linkShelfFloor(ShelfFloor floor) {
        this.shelfFloor = floor;
    }
}